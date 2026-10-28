import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "./SettingsRow";

interface OfflineVoiceEnhancementProps {
	inputPath: string;
	onEnhancedAudio: (audioPath: string) => void;
	disabled?: boolean;
}

export function OfflineVoiceEnhancement({
	inputPath,
	onEnhancedAudio,
	disabled = false,
}: OfflineVoiceEnhancementProps) {
	const [processing, setProcessing] = useState(false);
	const handleEnhance = async () => {
		if (!inputPath) {
			toast.error("Open a video in the editor first.");
			return;
		}
		setProcessing(true);
		try {
			const result = await window.electronAPI.voiceEnhancementRun(inputPath);
			if (result.canceled) return;
			if (!result.success || !result.outputPath) {
				toast.error(result.error || "Voice enhancement failed.");
				return;
			}
			onEnhancedAudio(result.outputPath);
			toast.success("Enhanced voice added to the timeline. The original video file is unchanged.");
		} catch {
			toast.error("Could not start voice enhancement. Please try again.");
		} finally {
			setProcessing(false);
		}
	};
	return (
		<SettingsRow
			title="Enhance voice"
			description="Reduce background noise and balance the spoken audio from the video currently open in the editor. Adds a separate enhanced audio track and keeps the original video unchanged."
			stacked
		>
			<Button
				variant="secondary"
				size="sm"
				onClick={() => void handleEnhance()}
				disabled={processing || disabled || !inputPath}
			>
				{processing ? "Enhancing voice…" : "Enhance current video"}
			</Button>
		</SettingsRow>
	);
}
