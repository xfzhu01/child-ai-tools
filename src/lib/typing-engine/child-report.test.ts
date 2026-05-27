import { describe, expect, it } from "vitest";
import { buildChildReportMetrics } from "@/lib/typing-engine/child-report";

describe("buildChildReportMetrics", () => {
  it("computes age-based WPM target and averages", () => {
    const report = buildChildReportMetrics({
      age: 8,
      streakDays: 3,
      sessions: [
        {
          wpm: 12,
          accuracy: 88,
          durationSec: 120,
          comboMax: 10,
          rawEvents: [],
          createdAt: new Date("2026-05-01T10:00:00Z"),
        },
        {
          wpm: 16,
          accuracy: 92,
          durationSec: 90,
          comboMax: 14,
          rawEvents: [],
          createdAt: new Date("2026-05-02T10:00:00Z"),
        },
      ],
      progressMap: {},
    });

    expect(report.wpmTarget).toBe(15);
    expect(report.avgAccuracy).toBe(90);
    expect(report.avgWpm).toBe(14);
    expect(report.totalPracticeMin).toBe(4);
    expect(report.chartPoints).toHaveLength(2);
  });

  it("marks trend as insufficient with fewer than six sessions", () => {
    const report = buildChildReportMetrics({
      age: 10,
      streakDays: 1,
      sessions: Array.from({ length: 4 }, (_, index) => ({
        wpm: 20 + index,
        accuracy: 90,
        durationSec: 60,
        comboMax: 8,
        rawEvents: [],
        createdAt: new Date(`2026-05-0${index + 1}T10:00:00Z`),
      })),
      progressMap: {},
    });

    expect(report.accuracyTrend).toBe("insufficient");
    expect(report.wpmTrend).toBe("insufficient");
  });
});
