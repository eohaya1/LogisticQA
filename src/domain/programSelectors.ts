import type {
  CustomDrill,
  DrillCategory,
  ProgramData,
  ProgressState,
  WorkoutCategoryId,
  WorkoutDay,
} from "./types";

export interface ProgramSummaryMetrics {
  workoutPillarCount: number;
  totalExercisesCount: number;
  totalSetsCount: number;
  nutritionHabitsCount: number;
  drillCategoriesCount: number;
  plannedDrillSlotsCount: number;
  customDrillsCount: number;
}

export interface WorkoutCompletionStats {
  completedCount: number;
  totalCount: number;
  percentComplete: number;
}

export function computeProgramSummaryMetrics(
  program: ProgramData,
  customDrills: CustomDrill[],
): ProgramSummaryMetrics {
  let totalExercisesCount = 0;
  let totalSetsCount = 0;

  for (const workout of program.workouts) {
    totalExercisesCount += workout.exercises.length;
    for (const exercise of workout.exercises) {
      totalSetsCount += exercise.sets;
    }
  }

  let plannedDrillSlotsCount = 0;
  for (const category of program.drills.categories) {
    plannedDrillSlotsCount += category.plannedSlots.length;
  }

  return {
    workoutPillarCount: program.workouts.length,
    totalExercisesCount,
    totalSetsCount,
    nutritionHabitsCount: program.nutrition.habits.length,
    drillCategoriesCount: program.drills.categories.length,
    plannedDrillSlotsCount,
    customDrillsCount: customDrills.length,
  };
}

export function computeWorkoutCompletion(
  workout: WorkoutDay,
  completedExerciseSet: ReadonlySet<string>,
): WorkoutCompletionStats {
  const totalCount = workout.exercises.length;
  if (totalCount === 0) {
    return { completedCount: 0, totalCount: 0, percentComplete: 0 };
  }

  let completedCount = 0;
  for (const exercise of workout.exercises) {
    if (completedExerciseSet.has(exercise.id)) {
      completedCount += 1;
    }
  }

  return {
    completedCount,
    totalCount,
    percentComplete: Math.round((completedCount / totalCount) * 100),
  };
}

export function filterWorkoutsByCategory(
  workouts: WorkoutDay[],
  selectedCategory: WorkoutCategoryId | "all",
): WorkoutDay[] {
  if (selectedCategory === "all") {
    return workouts;
  }
  return workouts.filter((workout) => workout.id === selectedCategory);
}

export function groupDrillsByCategory(
  categories: DrillCategory[],
  customDrills: CustomDrill[],
): Map<string, CustomDrill[]> {
  const grouped = new Map<string, CustomDrill[]>();
  for (const category of categories) {
    grouped.set(category.id, []);
  }

  for (const drill of customDrills) {
    const bucket = grouped.get(drill.categoryId);
    if (bucket) {
      bucket.push(drill);
    }
  }

  return grouped;
}

export function createEmptyProgress(): ProgressState {
  return {
    completedExerciseIds: [],
    completedHabitIds: [],
    completedWorkoutDayIds: [],
    customDrills: [],
  };
}

export function toggleIdInList(list: string[], id: string): string[] {
  const existing = new Set(list);
  if (existing.has(id)) {
    return list.filter((item) => item !== id);
  }
  return [...list, id];
}
