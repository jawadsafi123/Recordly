export type VoiceEnhancementOptions = {
  noiseReduction?: boolean;
  normalizeLoudness?: boolean;
  compression?: boolean;
  highPassHz?: number;
  noiseReductionStrength?: number;
};

const DEFAULTS = {
  highPassHz: 80,
  noiseReductionStrength: 10,
} as const;

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/**
 * Builds a conservative, offline FFmpeg audio filter chain for spoken voice.
 * This pure helper deliberately does not spawn FFmpeg or mutate media files.
 * Callers should render to a new temporary file and preserve the source audio.
 */
export function buildVoiceEnhancementFilters(options: VoiceEnhancementOptions = {}): string[] {
  const filters: string[] = [];
  const highPassHz = Math.round(boundedNumber(options.highPassHz, DEFAULTS.highPassHz, 40, 180));
  const noiseStrength = Math.round(
    boundedNumber(options.noiseReductionStrength, DEFAULTS.noiseReductionStrength, 0, 25),
  );

  filters.push(`highpass=f=${highPassHz}`);

  if (options.noiseReduction !== false && noiseStrength > 0) {
    // afftdn's reduction amount is intentionally bounded to avoid metallic speech.
    filters.push(`afftdn=nr=${noiseStrength}:nf=-45:tn=1`);
  }

  if (options.normalizeLoudness !== false) {
    // Single-pass normalization works without a separate analysis pass.
    filters.push("loudnorm=I=-16:LRA=11:TP=-1.5");
  }

  if (options.compression === true) {
    filters.push("acompressor=threshold=0.125:ratio=3:attack=20:release=250:makeup=1");
  }

  // Keep a final ceiling to reduce the chance of clipping after processing.
  filters.push("alimiter=limit=0.95:level=0");
  return filters;
}

export function buildVoiceEnhancementFilterGraph(
  inputLabel: string,
  outputLabel: string,
  options: VoiceEnhancementOptions = {},
): string {
  if (!/^\[[A-Za-z0-9_]+\]$/.test(inputLabel) || !/^\[[A-Za-z0-9_]+\]$/.test(outputLabel)) {
    throw new Error("FFmpeg audio labels must use bracketed alphanumeric identifiers.");
  }

  return `${inputLabel}${buildVoiceEnhancementFilters(options).join(",")}${outputLabel}`;
}
