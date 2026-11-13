import { describe, expect, it } from "vitest";
import rawDrills from "../data/drills.json";
import rawNutrition from "../data/nutrition.json";
import rawWorkouts from "../data/workouts.json";
import {
  ProgramParseError,
  parseProgramCatalog,
} from "../domain/programSchema";

describe("parseProgramCatalog", () => {
  it("parses valid declarative workout, nutrition, and drills catalogs", () => {
    // Arrange & Act
    const result = parseProgramCatalog(rawWorkouts, rawNutrition, rawDrills);

    // Assert
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.workouts.map((w) => w.id)).toEqual([
      "upper-body",
      "lower-body",
      "explosive",
      "running",
    ]);
    expect(result.data.nutrition.habits.length).toBeGreaterThanOrEqual(6);
    expect(result.data.drills.categories.length).toBe(4);
  });

  it("returns a typed ProgramParseError when workouts catalog is invalid", () => {
    // Arrange
    const brokenWorkouts = { version: "1.0.0", workouts: [] };

    // Act
    const result = parseProgramCatalog(brokenWorkouts, rawNutrition, rawDrills);

    // Assert
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBeInstanceOf(ProgramParseError);
    expect(result.error.section).toBe("workouts");
  });
});
