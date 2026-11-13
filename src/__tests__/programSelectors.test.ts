import { describe, expect, it } from "vitest";
import rawDrills from "../data/drills.json";
import rawNutrition from "../data/nutrition.json";
import rawWorkouts from "../data/workouts.json";
import { parseProgramCatalog } from "../domain/programSchema";
import {
  computeProgramSummaryMetrics,
  computeWorkoutCompletion,
  filterWorkoutsByCategory,
  groupDrillsByCategory,
} from "../domain/programSelectors";

describe("programSelectors", () => {
  const parsed = parseProgramCatalog(rawWorkouts, rawNutrition, rawDrills);
  if (!parsed.ok) {
    throw parsed.error;
  }
  const program = parsed.data;

  it("computes accurate summary metrics from parsed program data", () => {
    // Arrange
    const customDrills = [
      {
        id: "d-1",
        name: "Ball-Key Get-Off",
        categoryId: "get-off-stance",
        prescription: "4 × 5 reps",
        cue: "Zero false step",
        createdAtIso: "2026-11-13T00:00:00.000Z",
      },
    ];

    // Act
    const metrics = computeProgramSummaryMetrics(program, customDrills);

    // Assert
    expect(metrics.workoutPillarCount).toBe(4);
    expect(metrics.totalExercisesCount).toBe(24);
    expect(metrics.customDrillsCount).toBe(1);
    expect(metrics.nutritionHabitsCount).toBe(program.nutrition.habits.length);
  });

  it("computes workout completion percentage and filters by category", () => {
    // Arrange
    const upper = filterWorkoutsByCategory(program.workouts, "upper-body");
    expect(upper).toHaveLength(1);
    const firstTwo = new Set(upper[0].exercises.slice(0, 2).map((e) => e.id));

    // Act
    const stats = computeWorkoutCompletion(upper[0], firstTwo);

    // Assert
    expect(stats.completedCount).toBe(2);
    expect(stats.totalCount).toBe(upper[0].exercises.length);
    expect(stats.percentComplete).toBe(
      Math.round((2 / upper[0].exercises.length) * 100),
    );
  });

  it("groups custom drills into their respective category buckets", () => {
    // Arrange
    const drills = [
      {
        id: "d-1",
        name: "Hoop Bend",
        categoryId: "pass-rush",
        prescription: "3 × 4 each side",
        cue: "Dip inside shoulder",
        createdAtIso: "2026-11-13T00:00:00.000Z",
      },
    ];

    // Act
    const grouped = groupDrillsByCategory(program.drills.categories, drills);

    // Assert
    expect(grouped.get("pass-rush")).toHaveLength(1);
    expect(grouped.get("hands-shedding")).toHaveLength(0);
  });
});
