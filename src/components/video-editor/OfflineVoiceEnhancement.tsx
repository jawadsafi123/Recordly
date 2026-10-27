import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "./SettingsRow";

export function OfflineVoiceEnhancement() {
	const [processing, setProcessing] = useState(false);

	const handleEnhance = async () => {
		setProcessing(true);
		try {
			const result = await window.electronAPI.voiceEnhancementRun();
			if (result.canceled) return;
			if (!result.success) {
				toast.error(result.error || "Voice enhancement failed.");
				return;
			}
			toast.success("Enhanced recording saved. Your original file was kept unchanged.");
		} catch {
			toast.error("Could not start voice enhancement. Please try again.");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<SettingsRow
			title="Offline voice enhancement"
			description="Reduce steady background noise, balance loudness, and smooth voice levels. Runs locally and saves a separate file."
			stacked
		>
			<Button variant="secondary" size="sm" onClick={() => void handleEnhance()} disabled={processing}>
				{processing ? "Enhancing voice…" : "Choose audio or video"}
			</Button>
		</SettingsRow>
	);
}
