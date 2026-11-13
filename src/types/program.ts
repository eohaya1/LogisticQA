export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export type WorkoutCategoryId =
  | "upper-body"
  | "lower-body"
  | "explosive"
  | "running";

export type OffseasonPhaseId = "phase-1" | "phase-2" | "phase-3";

export interface OffseasonPhase {
  id: OffseasonPhaseId;
  name: string;
  weeksLabel: string;
  weekNumbers: number[];
  focus: string;
  rpeTarget: string;
  coachingNote: string;
}

export interface PhasePrescription {
  sets: string;
  reps: string;
  rest: string;
  intensityCue: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  equipment: string;
  dLineTransfer: string;
  coachingCue: string;
  alternative: string;
  prescriptionsByPhase: Record<OffseasonPhaseId, PhasePrescription>;
}

export interface DrillSlotMeta {
  status: "ready-for-coach-drills";
  title: string;
  description: string;
  suggestedTiming: string;
}

export interface WorkoutDay {
  id: WorkoutCategoryId;
  dayNumber: number;
  title: string;
  shortLabel: string;
  subtitle: string;
  durationMinutes: number;
  primaryGoal: string;
  warmUp: string[];
  exercises: ExerciseItem[];
  coolDown: string[];
  drillSlot: DrillSlotMeta;
}

export interface OffseasonProgramConfig {
  programName: string;
  targetAthlete: string;
  seasonType: "Offseason";
  totalWeeks: number;
  weeklyScheduleNote: string;
  phases: OffseasonPhase[];
  workoutDays: WorkoutDay[];
}

export type NutritionGoalId = "clean-mass" | "lean-strength" | "maintain";

export interface NutritionHabit {
  id: string;
  title: string;
  target: string;
  whyItMatters: string;
  highSchoolTip: string;
}

export interface MealFoodItem {
  food: string;
  portionByGoal: Record<NutritionGoalId, string>;
  budgetSwap: string;
}

export interface MealSlot {
  id: string;
  timing: string;
  name: string;
  purpose: string;
  estimatedCostPerServingUsd: number;
  foods: MealFoodItem[];
  prepTip: string;
}

export interface GroceryCategory {
  category: string;
  items: {
    name: string;
    weeklyQuantity: string;
    budgetNote: string;
  }[];
}

export interface NutritionConfig {
  budgetSummaryNote: string;
  goalModes: {
    id: NutritionGoalId;
    label: string;
    summary: string;
    macroFocus: string;
  }[];
  habits: NutritionHabit[];
  mealSlots: MealSlot[];
  groceryList: GroceryCategory[];
}

export type SpeedDirection = "lower-is-better" | "higher-is-better";

export interface LiftDefinition {
  id: string;
  name: string;
  unit: "lbs";
  category: WorkoutCategoryId;
  notes: string;
}

export interface SpeedMetricDefinition {
  id: string;
  name: string;
  unit: "sec" | "in";
  direction: SpeedDirection;
  dLineBenchmarkNote: string;
}

export interface TrackingConfig {
  lifts: LiftDefinition[];
  speedMetrics: SpeedMetricDefinition[];
}

export interface CustomDrill {
  id: string;
  dayId: WorkoutCategoryId;
  name: string;
  sets: string;
  repsOrDuration: string;
  coachingCue: string;
  createdAtIso: string;
}

export interface LiftGoal {
  liftId: string;
  startingWeightLbs: number;
  targetEndWeightLbs: number;
  targetReps: number;
  totalWeeks: number;
}

export interface LiftLogEntry {
  id: string;
  liftId: string;
  weekNumber: number;
  weightLbs: number;
  sets: number;
  reps: number;
  rpe?: number;
  notes?: string;
  loggedAtIso: string;
}

export interface SpeedGoal {
  metricId: string;
  baselineValue: number;
  targetValue: number;
}

export interface SpeedLogEntry {
  id: string;
  metricId: string;
  weekNumber: number;
  value: number;
  surface: "turf" | "grass" | "track" | "gym";
  notes?: string;
  loggedAtIso: string;
}

export interface WorkoutCompletionRecord {
  weekNumber: number;
  dayId: WorkoutCategoryId;
  completedAtIso: string;
  rpe?: number;
}

export interface AthleteTrackerState {
  schemaVersion: 1;
  athleteName: string;
  positionGroup: "DE" | "DT" | "NT" | "DL (General)";
  currentWeek: number;
  selectedNutritionGoal: NutritionGoalId;
  dailyHabitsCheckedIds: string[];
  checkedGroceryItems: string[];
  customDrills: CustomDrill[];
  workoutCompletions: WorkoutCompletionRecord[];
  liftGoals: Record<string, LiftGoal>;
  liftLogs: LiftLogEntry[];
  speedGoals: Record<string, SpeedGoal>;
  speedLogs: SpeedLogEntry[];
}
