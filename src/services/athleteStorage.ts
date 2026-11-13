import {
  err,
  ok,
  type AthleteTrackerState,
  type Result,
} from "../types/program";

const STORAGE_KEY = "trenches_lab_hs_dl_offseason_v1";

export class StorageError extends Error {
  readonly code: "READ_FAILED" | "WRITE_FAILED" | "INVALID_IMPORT_DATA";

  constructor(
    code: "READ_FAILED" | "WRITE_FAILED" | "INVALID_IMPORT_DATA",
    message: string
  ) {
    super(message);
    this.name = "StorageError";
    this.code = code;
  }
}

export function createInitialTrackerState(): AthleteTrackerState {
  return {
    schemaVersion: 1,
    athleteName: "",
    positionGroup: "DL (General)",
    currentWeek: 1,
    selectedNutritionGoal: "clean-mass",
    dailyHabitsCheckedIds: [],
    checkedGroceryItems: [],
    customDrills: [],
    workoutCompletions: [],
    liftGoals: {},
    liftLogs: [],
    speedGoals: {},
    speedLogs: [],
  };
}

function isValidTrackerState(candidate: unknown): candidate is AthleteTrackerState {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }
  const obj = candidate as Record<string, unknown>;
  return (
    obj.schemaVersion === 1 &&
    typeof obj.currentWeek === "number" &&
    Array.isArray(obj.liftLogs) &&
    Array.isArray(obj.speedLogs) &&
    Array.isArray(obj.workoutCompletions) &&
    Array.isArray(obj.customDrills) &&
    typeof obj.liftGoals === "object" &&
    obj.liftGoals !== null &&
    typeof obj.speedGoals === "object" &&
    obj.speedGoals !== null
  );
}

export function loadTrackerState(
  storage: Storage | undefined = typeof window !== "undefined"
    ? window.localStorage
    : undefined
): Result<AthleteTrackerState, StorageError> {
  if (!storage) {
    return ok(createInitialTrackerState());
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return ok(createInitialTrackerState());
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTrackerState(parsed)) {
      return err(
        new StorageError(
          "READ_FAILED",
          "Saved training log format is invalid. You can reset or export your raw data."
        )
      );
    }
    return ok(parsed);
  } catch (cause) {
    return err(
      new StorageError(
        "READ_FAILED",
        cause instanceof Error ? cause.message : "Could not read saved training logs."
      )
    );
  }
}

export function saveTrackerState(
  state: AthleteTrackerState,
  storage: Storage | undefined = typeof window !== "undefined"
    ? window.localStorage
    : undefined
): Result<void, StorageError> {
  if (!storage) {
    return ok(undefined);
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return ok(undefined);
  } catch (cause) {
    return err(
      new StorageError(
        "WRITE_FAILED",
        cause instanceof Error ? cause.message : "Could not save training logs locally."
      )
    );
  }
}

export function parseImportedTrackerState(
  rawJson: string
): Result<AthleteTrackerState, StorageError> {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!isValidTrackerState(parsed)) {
      return err(
        new StorageError(
          "INVALID_IMPORT_DATA",
          "Imported JSON does not match the Trenches Lab v1 training log format."
        )
      );
    }
    return ok(parsed);
  } catch (cause) {
    return err(
      new StorageError(
        "INVALID_IMPORT_DATA",
        cause instanceof Error ? cause.message : "Invalid JSON file."
      )
    );
  }
}
