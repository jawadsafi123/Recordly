import { spawn } from "node:child_process";
import path from "node:path";
import { dialog, ipcMain } from "electron";
import { getFfmpegBinaryPath } from "../ffmpeg/binary";
import { buildVoiceEnhancementFilters } from "../recording/voiceEnhancement";

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".mkv", ".webm"]);
const INPUT_EXTENSIONS = [
	"mp4", "mov", "m4v", "mkv", "webm",
	"m4a", "mp3", "wav", "aac", "flac", "ogg", "opus",
];

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

/** Registers a local-only voice enhancement flow. The source file is never overwritten. */
export function registerVoiceEnhancementHandlers() {
	ipcMain.handle("voice-enhancement:run", async () => {
		const selected = await dialog.showOpenDialog({
			title: "Choose a recording to enhance",
			properties: ["openFile"],
			filters: [{ name: "Audio and video files", extensions: INPUT_EXTENSIONS }],
		});
		if (selected.canceled || !selected.filePaths[0]) return { success: false, canceled: true };

		const inputPath = selected.filePaths[0];
		const extension = path.extname(inputPath).toLowerCase();
		const isVideo = VIDEO_EXTENSIONS.has(extension);
		const parsed = path.parse(inputPath);
		const outputExtension = isVideo ? (extension === ".webm" ? ".mkv" : extension) : ".m4a";
		const save = await dialog.showSaveDialog({
			title: "Save enhanced recording",
			defaultPath: path.join(parsed.dir, `${parsed.name}-enhanced${outputExtension}`),
			filters: [{ name: isVideo ? "Enhanced video" : "Enhanced audio", extensions: [outputExtension.slice(1)] }],
		});
		if (save.canceled || !save.filePath) return { success: false, canceled: true };
		if (path.resolve(save.filePath) === path.resolve(inputPath)) {
			return { success: false, error: "Choose a different output name so the original recording stays safe." };
		}

		const filters = buildVoiceEnhancementFilters().join(",");
		const args = ["-hide_banner", "-nostdin", "-y", "-i", inputPath];
		if (isVideo) {
			args.push("-map", "0:v?", "-map", "0:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-af", filters);
			if ([".mp4", ".m4v", ".mov"].includes(outputExtension)) args.push("-movflags", "+faststart");
		} else {
			args.push("-map", "0:a:0", "-vn", "-c:a", "aac", "-b:a", "192k", "-af", filters);
		}
		args.push(save.filePath);

		try {
			await runFfmpeg(args);
			return { success: true, outputPath: save.filePath };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Voice enhancement failed.",
			};
		}
	});
}
