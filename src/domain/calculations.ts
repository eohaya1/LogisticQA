import {
  err,
  ok,
  type LiftGoal,
  type LiftLogEntry,
  type MealSlot,
  type OffseasonPhase,
  type Result,
  type SpeedLogEntry,
  type SpeedMetricDefinition,
  type SpeedGoal,
  type WorkoutCompletionRecord,
} from "../types/program";

export class ValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export type WeeklyLiftStatus = "ahead" | "on-track" | "behind" | "not-logged";

export interface WeeklyLiftEvaluation {
  weekNumber: number;
  targetWeightLbs: number | null;
  bestLoggedWeightLbs: number | null;
  bestLoggedReps: number | null;
  bestEstimated1RM: number | null;
  status: WeeklyLiftStatus;
}

export interface SpeedSummary {
  metricId: string;
  personalBest: SpeedLogEntry | null;
  latestEntry: SpeedLogEntry | null;
  deltaFromBaseline: number | null;
  isImprovedVsBaseline: boolean | null;
  goalMet: boolean;
}

export function roundToNearestFiveLbs(weightLbs: number): number {
  return Math.round(weightLbs / 5) * 5;
}

export function getPhaseForWeek(
  weekNumber: number,
  phaseMap: ReadonlyMap<number, OffseasonPhase>,
  fallbackPhases: OffseasonPhase[]
): OffseasonPhase {
  const mapped = phaseMap.get(weekNumber);
  if (mapped) {
    return mapped;
  }
  const first = fallbackPhases[0];
  if (!first) {
    throw new Error("Offseason program must define at least one phase");
  }
  return first;
}

export function estimateOneRepMax(
  weightLbs: number,
  reps: number
): Result<number, ValidationError> {
  if (!Number.isFinite(weightLbs) || weightLbs <= 0) {
    return err(new ValidationError("weightLbs", "Weight must be greater than 0 lbs."));
  }
  if (!Number.isInteger(reps) || reps < 1 || reps > 30) {
    return err(new ValidationError("reps", "Reps must be a whole number between 1 and 30."));
  }
  if (reps === 1) {
    return ok(Math.round(weightLbs));
  }
  return ok(Math.round(weightLbs * (1 + reps / 30)));
}

export function computeWeeklyLiftTarget(
  goal: LiftGoal,
  weekNumber: number
): Result<number, ValidationError> {
  if (!Number.isFinite(goal.startingWeightLbs) || goal.startingWeightLbs <= 0) {
    return err(new ValidationError("startingWeightLbs", "Starting weight must be positive."));
  }
  if (!Number.isFinite(goal.targetEndWeightLbs) || goal.targetEndWeightLbs <= 0) {
    return err(new ValidationError("targetEndWeightLbs", "Target weight must be positive."));
  }
  if (!Number.isInteger(goal.totalWeeks) || goal.totalWeeks < 2) {
    return err(new ValidationError("totalWeeks", "Program length must be at least 2 weeks."));
  }
  const clampedWeek = Math.min(Math.max(weekNumber, 1), goal.totalWeeks);
  const progressRatio = (clampedWeek - 1) / (goal.totalWeeks - 1);
  const rawTarget =
    goal.startingWeightLbs +
    (goal.targetEndWeightLbs - goal.startingWeightLbs) * progressRatio;
  return ok(roundToNearestFiveLbs(rawTarget));
}

export function evaluateWeeklyLiftProgress(
  goal: LiftGoal | undefined,
  logsForLift: LiftLogEntry[],
  weekNumber: number
): WeeklyLiftEvaluation {
  const weekLogs = logsForLift.filter((entry) => entry.weekNumber === weekNumber);
  const targetResult = goal ? computeWeeklyLiftTarget(goal, weekNumber) : null;
  const targetWeightLbs =
    targetResult && targetResult.ok ? targetResult.value : null;

  if (weekLogs.length === 0) {
    return {
      weekNumber,
      targetWeightLbs,
      bestLoggedWeightLbs: null,
      bestLoggedReps: null,
      bestEstimated1RM: null,
      status: "not-logged",
    };
  }

  let bestWeight = 0;
  let bestReps = 0;
  let best1RM = 0;

  for (const log of weekLogs) {
    const e1rm = estimateOneRepMax(log.weightLbs, log.reps);
    const computed1RM = e1rm.ok ? e1rm.value : log.weightLbs;
    if (log.weightLbs > bestWeight) {
      bestWeight = log.weightLbs;
      bestReps = log.reps;
    }
    if (computed1RM > best1RM) {
      best1RM = computed1RM;
    }
  }

  if (targetWeightLbs === null) {
    return {
      weekNumber,
      targetWeightLbs: null,
      bestLoggedWeightLbs: bestWeight,
      bestLoggedReps: bestReps,
      bestEstimated1RM: best1RM,
      status: "on-track",
    };
  }

  const status: WeeklyLiftStatus =
    bestWeight > targetWeightLbs
      ? "ahead"
      : bestWeight === targetWeightLbs
        ? "on-track"
        : "behind";

  return {
    weekNumber,
    targetWeightLbs,
    bestLoggedWeightLbs: bestWeight,
    bestLoggedReps: bestReps,
    bestEstimated1RM: best1RM,
    status,
  };
}

export function isBetterMetricValue(
  candidate: number,
  reference: number,
  direction: SpeedMetricDefinition["direction"]
): boolean {
  return direction === "lower-is-better"
    ? candidate < reference
    : candidate > reference;
}

export function summarizeSpeedMetric(
  metric: SpeedMetricDefinition,
  goal: SpeedGoal | undefined,
  logsForMetric: SpeedLogEntry[]
): SpeedSummary {
  if (logsForMetric.length === 0) {
    return {
      metricId: metric.id,
      personalBest: null,
      latestEntry: null,
      deltaFromBaseline: null,
      isImprovedVsBaseline: null,
      goalMet: false,
    };
  }

  let best = logsForMetric[0]!;
  let latest = logsForMetric[0]!;

  for (const entry of logsForMetric) {
    if (isBetterMetricValue(entry.value, best.value, metric.direction)) {
      best = entry;
    }
    if (
      entry.weekNumber > latest.weekNumber ||
      (entry.weekNumber === latest.weekNumber && entry.loggedAtIso > latest.loggedAtIso)
    ) {
      latest = entry;
    }
  }

  const deltaFromBaseline =
    goal !== undefined ? Number((best.value - goal.baselineValue).toFixed(2)) : null;

  const isImprovedVsBaseline =
    goal !== undefined
      ? isBetterMetricValue(best.value, goal.baselineValue, metric.direction)
      : null;

  const goalMet =
    goal !== undefined
      ? best.value === goal.targetValue ||
        isBetterMetricValue(best.value, goal.targetValue, metric.direction)
      : false;

  return {
    metricId: metric.id,
    personalBest: best,
    latestEntry: latest,
    deltaFromBaseline,
    isImprovedVsBaseline,
    goalMet,
  };
}

export function computeDailyMealPlanCost(mealSlots: MealSlot[]): number {
  const total = mealSlots.reduce(
    (sum, slot) => sum + slot.estimatedCostPerServingUsd,
    0
  );
  return Number(total.toFixed(2));
}

export function computeOffseasonCompletionStats(
  completions: WorkoutCompletionRecord[],
  totalWeeks: number,
  daysPerWeek: number
): { completedCount: number; totalScheduled: number; percentComplete: number } {
  const uniqueKeys = new Set(
    completions.map((item) => `${item.weekNumber}:${item.dayId}`)
  );
  const totalScheduled = Math.max(totalWeeks * daysPerWeek, 1);
  const completedCount = uniqueKeys.size;
  const percentComplete = Math.min(
    100,
    Math.round((completedCount / totalScheduled) * 100)
  );
  return { completedCount, totalScheduled, percentComplete };
}

export function validatePositiveNumberInput(
  rawValue: string,
  fieldLabel: string,
  minValue: number,
  maxValue: number
): Result<number, ValidationError> {
  const trimmed = rawValue.trim();
  if (trimmed === "") {
    return err(new ValidationError(fieldLabel, `${fieldLabel} is required.`));
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < minValue || parsed > maxValue) {
    return err(
      new ValidationError(
        fieldLabel,
        `${fieldLabel} must be between ${minValue} and ${maxValue}.`
      )
    );
  }
  return ok(parsed);
}
