import { describe, expect, it } from "vitest";
import {
  buildVoiceEnhancementFilterGraph,
  buildVoiceEnhancementFilters,
} from "./voiceEnhancement";

describe("buildVoiceEnhancementFilters", () => {
  it("builds the default offline spoken-voice chain", () => {
    expect(buildVoiceEnhancementFilters()).toEqual([
      "highpass=f=80",
      "afftdn=nr=10:nf=-45:tn=1",
      "loudnorm=I=-16:LRA=11:TP=-1.5",
      "alimiter=limit=0.95:level=0",
    ]);
  });

  it("allows optional compression and disabling noise reduction", () => {
    expect(
      buildVoiceEnhancementFilters({
        noiseReduction: false,
        normalizeLoudness: false,
        compression: true,
      }),
    ).toEqual([
      "highpass=f=80",
      "acompressor=threshold=0.125:ratio=3:attack=20:release=250:makeup=1",
      "alimiter=limit=0.95:level=0",
    ]);
  });

  it("clamps user-controlled values to safe supported ranges", () => {
    expect(
      buildVoiceEnhancementFilters({
        highPassHz: 9999,
        noiseReductionStrength: -20,
      }),
    ).toEqual([
      "highpass=f=180",
      "loudnorm=I=-16:LRA=11:TP=-1.5",
      "alimiter=limit=0.95:level=0",
    ]);
  });

  it("supports a light noise-reduction setting", () => {
    expect(buildVoiceEnhancementFilters({ noiseReductionStrength: 3 })).toContain(
      "afftdn=nr=3:nf=-45:tn=1",
    );
  });
});

describe("buildVoiceEnhancementFilterGraph", () => {
  it("creates a labeled FFmpeg audio graph", () => {
    expect(buildVoiceEnhancementFilterGraph("[a0]", "[enhanced]")).toBe(
      "[a0]highpass=f=80,afftdn=nr=10:nf=-45:tn=1,loudnorm=I=-16:LRA=11:TP=-1.5,alimiter=limit=0.95:level=0[enhanced]",
    );
  });

  it("rejects invalid graph labels", () => {
    expect(() => buildVoiceEnhancementFilterGraph("a0", "[out]")).toThrow(
      "FFmpeg audio labels must use bracketed alphanumeric identifiers.",
    );
    expect(() => buildVoiceEnhancementFilterGraph("[a0];movie=x", "[out]")).toThrow();
  });
});
