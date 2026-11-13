import offseasonWorkoutsRaw from "./offseasonWorkouts.json";
import nutritionPlanRaw from "./nutritionPlan.json";
import trackingConfigRaw from "./trackingConfig.json";
import type {
  LiftDefinition,
  NutritionConfig,
  OffseasonPhase,
  OffseasonProgramConfig,
  SpeedMetricDefinition,
  TrackingConfig,
  WorkoutCategoryId,
  WorkoutDay,
} from "../types/program";

export const offseasonProgram: OffseasonProgramConfig =
  offseasonWorkoutsRaw as OffseasonProgramConfig;

export const nutritionConfig: NutritionConfig =
  nutritionPlanRaw as NutritionConfig;

export const trackingConfig: TrackingConfig =
  trackingConfigRaw as TrackingConfig;

export const workoutDayById: ReadonlyMap<WorkoutCategoryId, WorkoutDay> =
  new Map(offseasonProgram.workoutDays.map((day) => [day.id, day]));

export const phaseByWeekNumber: ReadonlyMap<number, OffseasonPhase> = new Map(
  offseasonProgram.phases.flatMap((phase) =>
    phase.weekNumbers.map((week) => [week, phase] as const)
  )
);

export const liftDefinitionById: ReadonlyMap<string, LiftDefinition> = new Map(
  trackingConfig.lifts.map((lift) => [lift.id, lift])
);

export const speedMetricById: ReadonlyMap<string, SpeedMetricDefinition> =
  new Map(trackingConfig.speedMetrics.map((metric) => [metric.id, metric]));
