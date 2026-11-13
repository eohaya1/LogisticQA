import { useCallback, useEffect, useState } from "react";
import {
  createInitialTrackerState,
  loadTrackerState,
  parseImportedTrackerState,
  saveTrackerState,
  StorageError,
} from "../services/athleteStorage";
import type {
  AthleteTrackerState,
  CustomDrill,
  LiftGoal,
  LiftLogEntry,
  NutritionGoalId,
  SpeedGoal,
  SpeedLogEntry,
  WorkoutCategoryId,
} from "../types/program";

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAthleteTracker() {
  const [state, setState] = useState<AthleteTrackerState>(() => {
    const loaded = loadTrackerState();
    return loaded.ok ? loaded.value : createInitialTrackerState();
  });

  const [storageError, setStorageError] = useState<string | null>(() => {
    const loaded = loadTrackerState();
    return loaded.ok ? null : loaded.error.message;
  });

  const [lastSavedMessage, setLastSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const result = saveTrackerState(state);
    if (!result.ok) {
      setStorageError(result.error.message);
    }
  }, [state]);

  const notifySaved = useCallback((message: string) => {
    setStorageError(null);
    setLastSavedMessage(message);
  }, []);

  const setCurrentWeek = useCallback(
    (weekNumber: number) => {
      const clamped = Math.min(Math.max(Math.round(weekNumber), 1), 12);
      setState((prev) => ({ ...prev, currentWeek: clamped }));
      notifySaved(`Switched active view to Week ${clamped}.`);
    },
    [notifySaved]
  );

  const updateAthleteProfile = useCallback(
    (
      athleteName: string,
      positionGroup: AthleteTrackerState["positionGroup"]
    ) => {
      setState((prev) => ({
        ...prev,
        athleteName: athleteName.trim(),
        positionGroup,
      }));
      notifySaved("Athlete profile updated.");
    },
    [notifySaved]
  );

  const setNutritionGoal = useCallback(
    (goalId: NutritionGoalId) => {
      setState((prev) => ({ ...prev, selectedNutritionGoal: goalId }));
      notifySaved("Updated daily meal portions for your goal.");
    },
    [notifySaved]
  );

  const toggleHabit = useCallback(
    (habitId: string) => {
      setState((prev) => {
        const exists = prev.dailyHabitsCheckedIds.includes(habitId);
        const dailyHabitsCheckedIds = exists
          ? prev.dailyHabitsCheckedIds.filter((id) => id !== habitId)
          : [...prev.dailyHabitsCheckedIds, habitId];
        return { ...prev, dailyHabitsCheckedIds };
      });
      notifySaved("Habit checklist updated.");
    },
    [notifySaved]
  );

  const resetDailyHabits = useCallback(() => {
    setState((prev) => ({ ...prev, dailyHabitsCheckedIds: [] }));
    notifySaved("Cleared daily habit checkmarks for a fresh day.");
  }, [notifySaved]);

  const toggleGroceryItem = useCallback(
    (itemKey: string) => {
      setState((prev) => {
        const exists = prev.checkedGroceryItems.includes(itemKey);
        const checkedGroceryItems = exists
          ? prev.checkedGroceryItems.filter((item) => item !== itemKey)
          : [...prev.checkedGroceryItems, itemKey];
        return { ...prev, checkedGroceryItems };
      });
    },
    []
  );

  const toggleWorkoutCompletion = useCallback(
    (weekNumber: number, dayId: WorkoutCategoryId) => {
      setState((prev) => {
        const exists = prev.workoutCompletions.some(
          (item) => item.weekNumber === weekNumber && item.dayId === dayId
        );
        const workoutCompletions = exists
          ? prev.workoutCompletions.filter(
              (item) => !(item.weekNumber === weekNumber && item.dayId === dayId)
            )
          : [
              ...prev.workoutCompletions,
              {
                weekNumber,
                dayId,
                completedAtIso: new Date().toISOString(),
              },
            ];
        return { ...prev, workoutCompletions };
      });
      notifySaved(`Updated Week ${weekNumber} workout completion.`);
    },
    [notifySaved]
  );

  const addCustomDrill = useCallback(
    (input: Omit<CustomDrill, "id" | "createdAtIso">) => {
      const drill: CustomDrill = {
        ...input,
        id: generateId("drill"),
        createdAtIso: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        customDrills: [...prev.customDrills, drill],
      }));
      notifySaved(`Added drill "${drill.name}".`);
    },
    [notifySaved]
  );

  const removeCustomDrill = useCallback(
    (drillId: string) => {
      setState((prev) => ({
        ...prev,
        customDrills: prev.customDrills.filter((d) => d.id !== drillId),
      }));
      notifySaved("Removed custom drill.");
    },
    [notifySaved]
  );

  const setLiftGoal = useCallback(
    (goal: LiftGoal) => {
      setState((prev) => ({
        ...prev,
        liftGoals: {
          ...prev.liftGoals,
          [goal.liftId]: goal,
        },
      }));
      notifySaved("Saved 12-week lifting goal.");
    },
    [notifySaved]
  );

  const addLiftLog = useCallback(
    (input: Omit<LiftLogEntry, "id" | "loggedAtIso">) => {
      const entry: LiftLogEntry = {
        ...input,
        id: generateId("lift"),
        loggedAtIso: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        liftLogs: [entry, ...prev.liftLogs],
      }));
      notifySaved(`Logged Week ${entry.weekNumber}: ${entry.weightLbs} lbs × ${entry.reps}.`);
    },
    [notifySaved]
  );

  const removeLiftLog = useCallback(
    (entryId: string) => {
      setState((prev) => ({
        ...prev,
        liftLogs: prev.liftLogs.filter((entry) => entry.id !== entryId),
      }));
      notifySaved("Deleted lift entry.");
    },
    [notifySaved]
  );

  const setSpeedGoal = useCallback(
    (goal: SpeedGoal) => {
      setState((prev) => ({
        ...prev,
        speedGoals: {
          ...prev.speedGoals,
          [goal.metricId]: goal,
        },
      }));
      notifySaved("Saved speed/power target.");
    },
    [notifySaved]
  );

  const addSpeedLog = useCallback(
    (input: Omit<SpeedLogEntry, "id" | "loggedAtIso">) => {
      const entry: SpeedLogEntry = {
        ...input,
        id: generateId("speed"),
        loggedAtIso: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        speedLogs: [entry, ...prev.speedLogs],
      }));
      notifySaved(`Logged Week ${entry.weekNumber} result: ${entry.value}.`);
    },
    [notifySaved]
  );

  const removeSpeedLog = useCallback(
    (entryId: string) => {
      setState((prev) => ({
        ...prev,
        speedLogs: prev.speedLogs.filter((entry) => entry.id !== entryId),
      }));
      notifySaved("Deleted speed log entry.");
    },
    [notifySaved]
  );

  const exportStateJson = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importStateJson = useCallback(
    (rawJson: string): boolean => {
      const parsed = parseImportedTrackerState(rawJson);
      if (!parsed.ok) {
        setStorageError(parsed.error.message);
        return false;
      }
      setState(parsed.value);
      notifySaved("Imported training log backup.");
      return true;
    },
    [notifySaved]
  );

  const resetAllData = useCallback(() => {
    const fresh = createInitialTrackerState();
    setState(fresh);
    const saved = saveTrackerState(fresh);
    if (!saved.ok && saved.error instanceof StorageError) {
      setStorageError(saved.error.message);
      return;
    }
    notifySaved("Reset all personal logs and goals.");
  }, [notifySaved]);

  return {
    state,
    storageError,
    lastSavedMessage,
    setCurrentWeek,
    updateAthleteProfile,
    setNutritionGoal,
    toggleHabit,
    resetDailyHabits,
    toggleGroceryItem,
    toggleWorkoutCompletion,
    addCustomDrill,
    removeCustomDrill,
    setLiftGoal,
    addLiftLog,
    removeLiftLog,
    setSpeedGoal,
    addSpeedLog,
    removeSpeedLog,
    exportStateJson,
    importStateJson,
    resetAllData,
  };
}
