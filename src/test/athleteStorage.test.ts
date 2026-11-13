import { describe, expect, it } from "vitest";
import {
  createInitialTrackerState,
  loadTrackerState,
  parseImportedTrackerState,
  saveTrackerState,
} from "../services/athleteStorage";

describe("athleteStorage", () => {
  it("returns clean initial state when storage is empty", () => {
    const loaded = loadTrackerState(window.localStorage);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.currentWeek).toBe(1);
      expect(loaded.value.liftLogs).toEqual([]);
      expect(loaded.value.speedLogs).toEqual([]);
    }
  });

  it("round-trips state cleanly through localStorage", () => {
    const initial = createInitialTrackerState();
    initial.athleteName = "Jordan #99";
    initial.currentWeek = 4;

    const saved = saveTrackerState(initial, window.localStorage);
    expect(saved.ok).toBe(true);

    const loaded = loadTrackerState(window.localStorage);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.athleteName).toBe("Jordan #99");
      expect(loaded.value.currentWeek).toBe(4);
    }
  });

  it("returns explicit StorageError when stored JSON is corrupted", () => {
    window.localStorage.setItem("trenches_lab_hs_dl_offseason_v1", "{bad json");
    const loaded = loadTrackerState(window.localStorage);
    expect(loaded.ok).toBe(false);
    if (!loaded.ok) {
      expect(loaded.error.code).toBe("READ_FAILED");
    }
  });

  it("rejects invalid imported JSON schema", () => {
    const parsed = parseImportedTrackerState('{"schemaVersion": 999}');
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.error.code).toBe("INVALID_IMPORT_DATA");
    }
  });
});
