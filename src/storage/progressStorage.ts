import { z } from "zod";
import { createEmptyProgress } from "../domain/programSelectors";
import type { ProgressState } from "../domain/types";

const STORAGE_KEY = "trench-ready.progress.v1";

const ProgressStateSchema = z.object({
  completedExerciseIds: z.array(z.string()),
  completedHabitIds: z.array(z.string()),
  completedWorkoutDayIds: z.array(
    z.enum(["upper-body", "lower-body", "explosive", "running"]),
  ),
  customDrills: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      categoryId: z.string().min(1),
      prescription: z.string().min(1),
      cue: z.string(),
      createdAtIso: z.string().min(1),
    }),
  ),
});

export class StorageReadError extends Error {
  constructor(readonly reason: string) {
    super(`Could not read saved training progress: ${reason}`);
    this.name = "StorageReadError";
  }
}

export class StorageWriteError extends Error {
  constructor(readonly reason: string) {
    super(`Could not save training progress: ${reason}`);
    this.name = "StorageWriteError";
  }
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: StorageReadError | StorageWriteError };

export function loadProgressFromStorage(): StorageResult<ProgressState> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { ok: true, data: createEmptyProgress() };
    }

    const parsedJson: unknown = JSON.parse(raw);
    const validated = ProgressStateSchema.safeParse(parsedJson);
    if (!validated.success) {
      return {
        ok: false,
        error: new StorageReadError("Saved data format did not match schema"),
      };
    }

    return { ok: true, data: validated.data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown storage error";
    return { ok: false, error: new StorageReadError(message) };
  }
}

export function saveProgressToStorage(
  state: ProgressState,
): StorageResult<ProgressState> {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true, data: state };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown storage write error";
    return { ok: false, error: new StorageWriteError(message) };
  }
}

export function clearProgressStorage(): StorageResult<ProgressState> {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return { ok: true, data: createEmptyProgress() };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown storage clear error";
    return { ok: false, error: new StorageWriteError(message) };
  }
}
