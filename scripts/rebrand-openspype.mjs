#!/usr/bin/env node
/**
 * OpenSpype rebrand script.
 *
 * Rewrites remaining Recordly branding across the codebase in one pass,
 * then prints a review report. Run from the repo root:
 *
 *   node scripts/rebrand-openspype.mjs           # preview only (no writes)
 *   node scripts/rebrand-openspype.mjs --write   # apply changes
 *
 * Review the output, then commit with git.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const WRITE = process.argv.includes("--write");

// Files where upstream attribution must be preserved (license compliance).
const PROTECTED_FILES = new Set([
	"ATTRIBUTION.md",
	"LICENSE.md",
	"THIRD_PARTY_NOTICES.md",
	"PHASE1.md",
	"REBRAND_REPORT.md",
]);

// Directories to never touch.
const SKIP_DIRS = new Set([
	".git",
	"node_modules",
	"dist",
	"dist-electron",
	"release",
	"out",
	"coverage",
]);

// Text file extensions we may rewrite.
const TEXT_EXTENSIONS = new Set([
	".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".json5", ".html",
	".css", ".md", ".txt", ".yml", ".yaml", ".sh", ".rb", ".plist",
]);

// Order matters: run longer/more specific replacements first.
const REPLACEMENTS = [
	// Upstream repo URLs -> our fork (must run before generic word replacements)
	["github.com/webadderallorg/Recordly", "github.com/jawadsafi123/OpenSpype"],
	["github.com/webadderall/Recordly", "github.com/jawadsafi123/OpenSpype"],
	["www.recordly.dev", "openspype.app"],
	["marketplace.recordly.dev", "marketplace.openspype.app"],
	["recordly.dev", "openspype.app"],
	// Electron app IDs / protocols / file types
	["dev.recordly.app", "dev.openspype.app"],
	["application/x-recordly-project", "application/x-openspype-project"],
	["recordly-dev", "openspype-dev"],
	[".recordly", ".openspype"],
	["Recordly-dev", "OpenSpype-dev"],
	// User-facing names
	["Recordly", "OpenSpype"],
	["recordly", "openspype"],
	["RECORDLY", "OPENSYPE"],
];

function* walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) yield* walk(full);
		} else if (TEXT_EXTENSIONS.has(extname(entry.name))) {
			yield full;
		}
	}
}

function isProtected(filePath) {
	return [...PROTECTED_FILES].some((name) => filePath === name || filePath.endsWith(`/${name}`));
}

const changedFiles = [];
let totalReplacements = 0;

for (const filePath of walk(".")) {
	if (isProtected(filePath)) continue;

	let content;
	try {
		content = readFileSync(filePath, "utf-8");
	} catch {
		continue;
	}

	let fileCount = 0;
	let updated = content;
	for (const [from, to] of REPLACEMENTS) {
		// count occurrences
		let index = updated.indexOf(from);
		let count = 0;
		while (index !== -1) {
			count++;
			index = updated.indexOf(from, index + from.length);
		}
		if (count > 0) {
			updated = updated.split(from).join(to);
			fileCount += count;
		}
	}

	if (fileCount > 0) {
		totalReplacements += fileCount;
		changedFiles.push({ filePath, count: fileCount });
		if (WRITE) {
			writeFileSync(filePath, updated, "utf-8");
		}
	}
}

console.log(
	WRITE
		? `\nApplied ${totalReplacements} replacements across ${changedFiles.length} files.`
		: `\nPreview: ${totalReplacements} replacements across ${changedFiles.length} files (no writes). Re-run with --write to apply.`,
);
for (const { filePath, count } of changedFiles) {
	console.log(`  ${String(count).padStart(4)}x  ${filePath}`);
}
if (changedFiles.length === 0) {
	console.log("No remaining Recordly references found. Rebrand complete.");
}
if (!WRITE) {
	console.log("\nNext steps:");
	console.log("  1. node scripts/rebrand-openspype.mjs --write");
	console.log("  2. git add -A && git commit -m 'Phase 1: apply codebase-wide rebrand'");
	console.log("  3. npm run typecheck && npm run test");
}
