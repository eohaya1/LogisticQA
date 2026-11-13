import { describe, expect, it } from "vitest";
import {
  computeDailyMealPlanCost,
  computeOffseasonCompletionStats,
  computeWeeklyLiftTarget,
  estimateOneRepMax,
  evaluateWeeklyLiftProgress,
  summarizeSpeedMetric,
  validatePositiveNumberInput,
} from "../domain/calculations";
import { nutritionConfig, trackingConfig } from "../data/programRepository";
import type { LiftGoal, LiftLogEntry, SpeedLogEntry } from "../types/program";

describe("domain calculations", () => {
  it("estimates 1RM accurately for single and multi-rep sets", () => {
    const single = estimateOneRepMax(225, 1);
    expect(single.ok).toBe(true);
    if (single.ok) expect(single.value).toBe(225);

    const fiveRep = estimateOneRepMax(180, 5);
    expect(fiveRep.ok).toBe(true);
    if (fiveRep.ok) expect(fiveRep.value).toBe(210);

    const invalid = estimateOneRepMax(-10, 5);
    expect(invalid.ok).toBe(false);
  });

  it("computes plate-rounded 5-lb weekly lift targets from Week 1 to Week 12", () => {
    const goal: LiftGoal = {
      liftId: "bench-press",
      startingWeightLbs: 155,
      targetEndWeightLbs: 210,
      targetReps: 5,
      totalWeeks: 12,
    };

    const wk1 = computeWeeklyLiftTarget(goal, 1);
    const wk6 = computeWeeklyLiftTarget(goal, 6);
    const wk12 = computeWeeklyLiftTarget(goal, 12);

    expect(wk1.ok && wk1.value).toBe(155);
    expect(wk6.ok && wk6.value).toBe(180);
    expect(wk12.ok && wk12.value).toBe(210);
  });

  it("evaluates weekly lift progress status correctly (ahead, on-track, behind, not-logged)", () => {
    const goal: LiftGoal = {
      liftId: "back-squat",
      startingWeightLbs: 225,
      targetEndWeightLbs: 280,
      targetReps: 5,
      totalWeeks: 12,
    };

    const logs: LiftLogEntry[] = [
      {
        id: "l1",
        liftId: "back-squat",
        weekNumber: 1,
        weightLbs: 225,
        sets: 4,
        reps: 5,
        loggedAtIso: "2026-01-01T00:00:00Z",
      },
      {
        id: "l2",
        liftId: "back-squat",
        weekNumber: 2,
        weightLbs: 245,
        sets: 4,
        reps: 5,
        loggedAtIso: "2026-01-08T00:00:00Z",
      },
      {
        id: "l3",
        liftId: "back-squat",
        weekNumber: 3,
        weightLbs: 220,
        sets: 4,
        reps: 5,
        loggedAtIso: "2026-01-15T00:00:00Z",
      },
    ];

    expect(evaluateWeeklyLiftProgress(goal, logs, 1).status).toBe("on-track");
    expect(evaluateWeeklyLiftProgress(goal, logs, 2).status).toBe("ahead");
    expect(evaluateWeeklyLiftProgress(goal, logs, 3).status).toBe("behind");
    expect(evaluateWeeklyLiftProgress(goal, logs, 4).status).toBe("not-logged");
  });

  it("summarizes speed metrics for both lower-is-better sprints and higher-is-better jumps", () => {
    const fortyMetric = trackingConfig.speedMetrics.find(
      (m) => m.id === "40-yd-dash"
    )!;
    const sprintLogs: SpeedLogEntry[] = [
      {
        id: "s1",
        metricId: "40-yd-dash",
        weekNumber: 1,
        value: 5.2,
        surface: "turf",
        loggedAtIso: "2026-01-02T00:00:00Z",
      },
      {
        id: "s2",
        metricId: "40-yd-dash",
        weekNumber: 4,
        value: 4.95,
        surface: "turf",
        loggedAtIso: "2026-01-23T00:00:00Z",
      },
    ];

    const sprintSummary = summarizeSpeedMetric(
      fortyMetric,
      { metricId: "40-yd-dash", baselineValue: 5.2, targetValue: 4.95 },
      sprintLogs
    );

    expect(sprintSummary.personalBest?.value).toBe(4.95);
    expect(sprintSummary.deltaFromBaseline).toBe(-0.25);
    expect(sprintSummary.isImprovedVsBaseline).toBe(true);
    expect(sprintSummary.goalMet).toBe(true);

    const broadJumpMetric = trackingConfig.speedMetrics.find(
      (m) => m.id === "broad-jump"
    )!;
    const jumpLogs: SpeedLogEntry[] = [
      {
        id: "j1",
        metricId: "broad-jump",
        weekNumber: 1,
        value: 88,
        surface: "turf",
        loggedAtIso: "2026-01-02T00:00:00Z",
      },
      {
        id: "j2",
        metricId: "broad-jump",
        weekNumber: 3,
        value: 94,
        surface: "turf",
        loggedAtIso: "2026-01-16T00:00:00Z",
      },
    ];

    const jumpSummary = summarizeSpeedMetric(
      broadJumpMetric,
      { metricId: "broad-jump", baselineValue: 88, targetValue: 96 },
      jumpLogs
    );

    expect(jumpSummary.personalBest?.value).toBe(94);
    expect(jumpSummary.deltaFromBaseline).toBe(6);
    expect(jumpSummary.isImprovedVsBaseline).toBe(true);
    expect(jumpSummary.goalMet).toBe(false);
  });

  it("computes affordable daily meal cost and offseason workout completion stats", () => {
    const dailyCost = computeDailyMealPlanCost(nutritionConfig.mealSlots);
    expect(dailyCost).toBeGreaterThan(8);
    expect(dailyCost).toBeLessThan(15);

    const stats = computeOffseasonCompletionStats(
      [
        {
          weekNumber: 1,
          dayId: "upper-body",
          completedAtIso: "2026-01-01T00:00:00Z",
        },
        {
          weekNumber: 1,
          dayId: "upper-body",
          completedAtIso: "2026-01-01T00:00:00Z",
        },
        {
          weekNumber: 1,
          dayId: "lower-body",
          completedAtIso: "2026-01-02T00:00:00Z",
        },
      ],
      12,
      4
    );

    expect(stats.completedCount).toBe(2);
    expect(stats.totalScheduled).toBe(48);
    expect(stats.percentComplete).toBe(4);
  });

  it("validates positive numeric form inputs cleanly", () => {
    expect(validatePositiveNumberInput("", "Weight", 10, 1000).ok).toBe(false);
    expect(validatePositiveNumberInput("-5", "Weight", 10, 1000).ok).toBe(false);
    const valid = validatePositiveNumberInput("185", "Weight", 10, 1000);
    expect(valid.ok && valid.value).toBe(185);
  });
});
