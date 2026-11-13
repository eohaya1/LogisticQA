import { z } from "zod";
import type { ProgramData } from "./types";

const WorkoutCategoryIdSchema = z.enum([
  "upper-body",
  "lower-body",
  "explosive",
  "running",
]);

const ScheduleCategoryIdSchema = z.enum([
  "upper-body",
  "lower-body",
  "explosive",
  "running",
  "recovery",
]);

const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.string().min(1),
  rest: z.string().min(1),
  intensity: z.string().min(1),
  cue: z.string().min(1),
});

const WorkoutDaySchema = z.object({
  id: WorkoutCategoryIdSchema,
  title: z.string().min(1),
  subtitle: z.string().min(1),
  focus: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  recommendedDays: z.array(z.string().min(1)).min(1),
  exercises: z.array(ExerciseSchema).min(1),
});

const WeeklyScheduleSlotSchema = z.object({
  day: z.string().min(1),
  categoryId: ScheduleCategoryIdSchema,
  label: z.string().min(1),
  duration: z.string().min(1),
});

const WorkoutsCatalogSchema = z.object({
  version: z.string().min(1),
  athleteProfile: z.string().min(1),
  weeklySchedule: z.array(WeeklyScheduleSlotSchema).min(1),
  workouts: z.array(WorkoutDaySchema).min(1),
});

const NutritionCatalogSchema = z.object({
  version: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  portionRule: z
    .array(
      z.object({
        macro: z.string().min(1),
        portion: z.string().min(1),
        examples: z.string().min(1),
      }),
    )
    .min(1),
  habits: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        timing: z.string().min(1),
        detail: z.string().min(1),
        whyItMatters: z.string().min(1),
      }),
    )
    .min(1),
  sampleMealPlan: z
    .array(
      z.object({
        slot: z.string().min(1),
        meal: z.string().min(1),
      }),
    )
    .min(1),
});

const DrillsCatalogSchema = z.object({
  version: z.string().min(1),
  status: z.string().min(1),
  note: z.string().min(1),
  categories: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        plannedSlots: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
});

export class ProgramParseError extends Error {
  constructor(
    readonly section: "workouts" | "nutrition" | "drills",
    readonly details: string,
  ) {
    super(`Invalid ${section} catalog: ${details}`);
    this.name = "ProgramParseError";
  }
}

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ProgramParseError };

export function parseProgramCatalog(
  rawWorkouts: unknown,
  rawNutrition: unknown,
  rawDrills: unknown,
): ParseResult<ProgramData> {
  const parsedWorkouts = WorkoutsCatalogSchema.safeParse(rawWorkouts);
  if (!parsedWorkouts.success) {
    return {
      ok: false,
      error: new ProgramParseError("workouts", parsedWorkouts.error.message),
    };
  }

  const parsedNutrition = NutritionCatalogSchema.safeParse(rawNutrition);
  if (!parsedNutrition.success) {
    return {
      ok: false,
      error: new ProgramParseError("nutrition", parsedNutrition.error.message),
    };
  }

  const parsedDrills = DrillsCatalogSchema.safeParse(rawDrills);
  if (!parsedDrills.success) {
    return {
      ok: false,
      error: new ProgramParseError("drills", parsedDrills.error.message),
    };
  }

  return {
    ok: true,
    data: {
      athleteProfile: parsedWorkouts.data.athleteProfile,
      weeklySchedule: parsedWorkouts.data.weeklySchedule,
      workouts: parsedWorkouts.data.workouts,
      nutrition: parsedNutrition.data,
      drills: parsedDrills.data,
    },
  };
}
