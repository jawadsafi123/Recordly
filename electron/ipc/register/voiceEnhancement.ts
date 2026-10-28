import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { dialog, ipcMain } from "electron";
import { getFfmpegBinaryPath } from "../ffmpeg/binary";
import { buildVoiceEnhancementFilters } from "../recording/voiceEnhancement";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".mkv", ".webm"]);

function runFfmpeg(args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		let stderr = "";
		const child = spawn(getFfmpegBinaryPath(), args, { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", (chunk: string) => {
			stderr = (stderr + chunk).slice(-12000);
		});
		child.once("error", reject);
		child.once("close", (code) => {
			if (code === 0) {
				resolve();
				return;
			}
			const detail = stderr.split(/\r?\n/).filter(Boolean).slice(-5).join(" ");
			reject(new Error(detail || `FFmpeg exited with code ${code ?? "unknown"}.`));
		});
	});
}

/** Enhances the currently open video's audio into a separate local file. The source is never overwritten. */
export function registerVoiceEnhancementHandlers() {
	ipcMain.handle("voice-enhancement:run", async (_event, inputPath: unknown) => {
		if (typeof inputPath !== "string" || !path.isAbsolute(inputPath)) {
			return { success: false, error: "Open a video in the editor before enhancing its voice." };
		}
		try {
			await fs.access(inputPath);
		} catch {
			return { success: false, error: "The currently open video file could not be found." };
		}

		const extension = path.extname(inputPath).toLowerCase();
		if (!VIDEO_EXTENSIONS.has(extension)) {
			return { success: false, error: "Voice enhancement currently supports video files opened in the editor." };
		}
		const parsed = path.parse(inputPath);
		const save = await dialog.showSaveDialog({
			title: "Save enhanced voice audio",
			defaultPath: path.join(parsed.dir, `${parsed.name}-enhanced-voice.m4a`),
			filters: [{ name: "Enhanced voice audio", extensions: ["m4a"] }],
		});
		if (save.canceled || !save.filePath) return { success: false, canceled: true };
		if (path.resolve(save.filePath) === path.resolve(inputPath)) {
			return { success: false, error: "Choose a separate audio filename to keep your original video safe." };
		}
		try {
			await fs.access(save.filePath);
			return { success: false, error: "That output file already exists. Choose a new name to avoid overwriting another file." };
		} catch {
			// The destination does not exist.
		}

		const args = [
			"-hide_banner", "-nostdin", "-y", "-i", inputPath,
			"-map", "0:a:0", "-vn", "-c:a", "aac", "-b:a", "192k",
			"-af", buildVoiceEnhancementFilters().join(","), save.filePath,
		];
		try {
			await runFfmpeg(args);
			return { success: true, outputPath: save.filePath };
		} catch (error) {
			await fs.rm(save.filePath, { force: true }).catch(() => undefined);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Voice enhancement failed.",
			};
		}
	});
}
