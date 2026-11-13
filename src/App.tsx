import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Apple,
  ClipboardList,
  Dumbbell,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import rawDrills from "./data/drills.json";
import rawNutrition from "./data/nutrition.json";
import rawWorkouts from "./data/workouts.json";
import { DrillsPanel } from "./components/DrillsPanel";
import { NutritionPanel } from "./components/NutritionPanel";
import { OverviewPanel } from "./components/OverviewPanel";
import { WorkoutsPanel } from "./components/WorkoutsPanel";
import { parseProgramCatalog } from "./domain/programSchema";
import { createEmptyProgress, toggleIdInList } from "./domain/programSelectors";
import type {
  ActiveTab,
  CustomDrill,
  ProgramData,
  ProgressState,
  WorkoutCategoryId,
  WorkoutDay,
} from "./domain/types";
import {
  clearProgressStorage,
  loadProgressFromStorage,
  saveProgressToStorage,
} from "./storage/progressStorage";

const TAB_ITEMS: Array<{
  id: ActiveTab;
  label: string;
  Icon: typeof LayoutGrid;
}> = [
  { id: "overview", label: "Overview", Icon: LayoutGrid },
  { id: "workouts", label: "Workouts", Icon: Dumbbell },
  { id: "nutrition", label: "Healthy Eating", Icon: Apple },
  { id: "drills", label: "Drills (Add Later)", Icon: ClipboardList },
];

const parsedCatalog = parseProgramCatalog(
  rawWorkouts,
  rawNutrition,
  rawDrills,
);

export function App() {
  if (!parsedCatalog.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-rose-950"
        >
          <h1 className="text-xl font-bold">
            Training program could not be loaded
          </h1>
          <p className="mt-2 text-sm">
            One of the workout or nutrition configuration files is invalid and
            needs attention before displaying the schedule.
          </p>
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer font-semibold">
              Show technical details
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-white p-3 text-rose-900">
              {parsedCatalog.error.message}
            </pre>
          </details>
        </div>
      </main>
    );
  }

  return <TrenchReadyShell program={parsedCatalog.data} />;
}

interface TrenchReadyShellProps {
  program: ProgramData;
}

function TrenchReadyShell({ program }: TrenchReadyShellProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [selectedWorkoutCategory, setSelectedWorkoutCategory] = useState<
    WorkoutCategoryId | "all"
  >("all");
  const [progress, setProgress] = useState<ProgressState>(() => {
    const loaded = loadProgressFromStorage();
    return loaded.ok ? loaded.data : createEmptyProgress();
  });
  const [storageWarning, setStorageWarning] = useState<string | null>(() => {
    const loaded = loadProgressFromStorage();
    return loaded.ok ? null : loaded.error.message;
  });

  useEffect(() => {
    if (storageWarning !== null) {
      return;
    }
    const saved = saveProgressToStorage(progress);
    if (!saved.ok) {
      setStorageWarning(saved.error.message);
    }
  }, [progress, storageWarning]);

  function handleOpenWorkoutCategory(categoryId: WorkoutCategoryId) {
    setSelectedWorkoutCategory(categoryId);
    setActiveTab("workouts");
  }

  function handleToggleExercise(exerciseId: string) {
    setProgress((prev) => ({
      ...prev,
      completedExerciseIds: toggleIdInList(
        prev.completedExerciseIds,
        exerciseId,
      ),
    }));
  }

  function handleMarkDayComplete(workout: WorkoutDay) {
    setProgress((prev) => {
      const merged = new Set(prev.completedExerciseIds);
      for (const exercise of workout.exercises) {
        merged.add(exercise.id);
      }
      return {
        ...prev,
        completedExerciseIds: Array.from(merged),
      };
    });
  }

  function handleResetDayProgress(workout: WorkoutDay) {
    const idsToClear = new Set(workout.exercises.map((e) => e.id));
    setProgress((prev) => ({
      ...prev,
      completedExerciseIds: prev.completedExerciseIds.filter(
        (id) => !idsToClear.has(id),
      ),
    }));
  }

  function handleToggleHabit(habitId: string) {
    setProgress((prev) => ({
      ...prev,
      completedHabitIds: toggleIdInList(prev.completedHabitIds, habitId),
    }));
  }

  function handleResetHabits() {
    setProgress((prev) => ({
      ...prev,
      completedHabitIds: [],
    }));
  }

  function handleAddDrill(input: {
    name: string;
    categoryId: string;
    prescription: string;
    cue: string;
  }) {
    const newDrill: CustomDrill = {
      id: `drill-${Date.now()}`,
      name: input.name,
      categoryId: input.categoryId,
      prescription: input.prescription,
      cue: input.cue,
      createdAtIso: new Date().toISOString(),
    };
    setProgress((prev) => ({
      ...prev,
      customDrills: [newDrill, ...prev.customDrills],
    }));
  }

  function handleRemoveDrill(drillId: string) {
    setProgress((prev) => ({
      ...prev,
      customDrills: prev.customDrills.filter((d) => d.id !== drillId),
    }));
  }

  function handleResetCorruptedStorage() {
    const cleared = clearProgressStorage();
    if (cleared.ok) {
      setProgress(cleared.data);
      setStorageWarning(null);
    } else {
      setStorageWarning(cleared.error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-400/30">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Starter HS Defensive Line Program
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {program.athleteProfile}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                TrenchReady — HS Defensive Lineman Training
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-300">
                Upper Body, Lower Body, Explosive Days, Running Days with sets
                &amp; reps, Healthy Eating Habits, and a staged Drills slot.
              </p>
            </div>
          </div>

          <nav aria-label="Program sections" className="mt-6">
            <div
              role="tablist"
              className="flex flex-wrap gap-2"
            >
              {TAB_ITEMS.map(({ id, label, Icon }) => {
                const isSelected = activeTab === id;
                return (
                  <button
                    key={id}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {storageWarning && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold">
                  Saved progress on this browser could not be loaded cleanly.
                </p>
                <p className="text-xs text-amber-900">
                  Your starter program is still visible below. Reset local
                  progress to re-enable browser saving.
                </p>
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-semibold">
                    Show technical details
                  </summary>
                  <pre className="mt-1 rounded bg-white p-2 text-slate-800">
                    {storageWarning}
                  </pre>
                </details>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetCorruptedStorage}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 min-h-[44px]"
            >
              Reset Saved Progress
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewPanel
            program={program}
            progress={progress}
            onOpenWorkoutCategory={handleOpenWorkoutCategory}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "workouts" && (
          <WorkoutsPanel
            workouts={program.workouts}
            selectedCategory={selectedWorkoutCategory}
            completedExerciseIds={progress.completedExerciseIds}
            onSelectCategory={setSelectedWorkoutCategory}
            onToggleExercise={handleToggleExercise}
            onMarkDayComplete={handleMarkDayComplete}
            onResetDayProgress={handleResetDayProgress}
          />
        )}

        {activeTab === "nutrition" && (
          <NutritionPanel
            nutrition={program.nutrition}
            completedHabitIds={progress.completedHabitIds}
            onToggleHabit={handleToggleHabit}
            onResetHabits={handleResetHabits}
          />
        )}

        {activeTab === "drills" && (
          <DrillsPanel
            drills={program.drills}
            customDrills={progress.customDrills}
            onAddDrill={handleAddDrill}
            onRemoveDrill={handleRemoveDrill}
          />
        )}
      </main>
    </div>
  );
}

export default App;
