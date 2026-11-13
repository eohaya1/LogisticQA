export type WorkoutCategoryId =
  | "upper-body"
  | "lower-body"
  | "explosive"
  | "running";

export type ScheduleCategoryId = WorkoutCategoryId | "recovery";

export type ActiveTab = "overview" | "workouts" | "nutrition" | "drills";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  intensity: string;
  cue: string;
}

export interface WorkoutDay {
  id: WorkoutCategoryId;
  title: string;
  subtitle: string;
  focus: string;
  estimatedMinutes: number;
  recommendedDays: string[];
  exercises: Exercise[];
}

export interface WeeklyScheduleSlot {
  day: string;
  categoryId: ScheduleCategoryId;
  label: string;
  duration: string;
}

export interface PortionRule {
  macro: string;
  portion: string;
  examples: string;
}

export interface NutritionHabit {
  id: string;
  title: string;
  timing: string;
  detail: string;
  whyItMatters: string;
}

export interface MealBlueprintSlot {
  slot: string;
  meal: string;
}

export interface NutritionGuide {
  version: string;
  title: string;
  summary: string;
  portionRule: PortionRule[];
  habits: NutritionHabit[];
  sampleMealPlan: MealBlueprintSlot[];
}

export interface DrillCategory {
  id: string;
  title: string;
  description: string;
  plannedSlots: string[];
}

export interface DrillsBlueprint {
  version: string;
  status: string;
  note: string;
  categories: DrillCategory[];
}

export interface CustomDrill {
  id: string;
  name: string;
  categoryId: string;
  prescription: string;
  cue: string;
  createdAtIso: string;
}

export interface ProgramData {
  athleteProfile: string;
  weeklySchedule: WeeklyScheduleSlot[];
  workouts: WorkoutDay[];
  nutrition: NutritionGuide;
  drills: DrillsBlueprint;
}

export interface ProgressState {
  completedExerciseIds: string[];
  completedHabitIds: string[];
  completedWorkoutDayIds: WorkoutCategoryId[];
  customDrills: CustomDrill[];
}
