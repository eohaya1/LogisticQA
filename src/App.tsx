import { useState } from "react";
import {
  Dumbbell,
  Gauge,
  LayoutGrid,
  Settings,
  Shield,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { NutritionView } from "./components/NutritionView";
import { OverviewView, type AppTab } from "./components/OverviewView";
import { SettingsModal } from "./components/SettingsModal";
import { SpeedTrackerView } from "./components/SpeedTrackerView";
import { StrengthTrackerView } from "./components/StrengthTrackerView";
import { WorkoutsView } from "./components/WorkoutsView";
import { offseasonProgram, phaseByWeekNumber } from "./data/programRepository";
import { getPhaseForWeek } from "./domain/calculations";
import { useAthleteTracker } from "./hooks/useAthleteTracker";
import type { WorkoutCategoryId } from "./types/program";

const NAV_TABS: { id: AppTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "workouts", label: "Workouts & Drills", icon: Dumbbell },
  { id: "nutrition", label: "Meal Plan & Habits", icon: Utensils },
  { id: "strength", label: "Lifting Goals", icon: TrendingUp },
  { id: "speed", label: "Speed & Combine", icon: Gauge },
];

export function App() {
  const {
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
  } = useAthleteTracker();

  const [activeTab, setActiveTab] = useState<AppTab>("overview");
  const [selectedWorkoutDay, setSelectedWorkoutDay] =
    useState<WorkoutCategoryId>("upper-body");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activePhase = getPhaseForWeek(
    state.currentWeek,
    phaseByWeekNumber,
    offseasonProgram.phases
  );

  function handleSelectWorkoutDayFromOverview(dayId: WorkoutCategoryId) {
    setSelectedWorkoutDay(dayId);
    setActiveTab("workouts");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
                <Shield className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
                    Trenches Lab — HS D-Line Offseason
                  </h1>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                    {state.positionGroup}
                    {state.athleteName ? ` • ${state.athleteName}` : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {activePhase.name} ({activePhase.weeksLabel})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200">
                <span>Active Week</span>
                <select
                  aria-label="Active offseason week"
                  value={state.currentWeek}
                  onChange={(e) => setCurrentWeek(Number(e.target.value))}
                  className="rounded-md bg-slate-800 px-2 py-1 text-xs font-bold text-amber-400 tabular-nums"
                >
                  {Array.from(
                    { length: offseasonProgram.totalWeeks },
                    (_, idx) => idx + 1
                  ).map((wk) => (
                    <option key={wk} value={wk}>
                      Week {wk}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                <Settings className="h-4 w-4" aria-hidden />
                Profile & Backup
              </button>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav
            aria-label="Main sections"
            role="tablist"
            className="mt-4 flex flex-wrap gap-1.5"
          >
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {storageError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {storageError}
          </div>
        )}

        {lastSavedMessage && !storageError && (
          <div
            aria-live="polite"
            className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600"
          >
            Saved locally: {lastSavedMessage}
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewView
            state={state}
            onNavigateTab={setActiveTab}
            onSelectWorkoutDay={handleSelectWorkoutDayFromOverview}
          />
        )}

        {activeTab === "workouts" && (
          <WorkoutsView
            state={state}
            selectedDayId={selectedWorkoutDay}
            onSelectDayId={setSelectedWorkoutDay}
            onToggleWorkoutCompletion={toggleWorkoutCompletion}
            onAddCustomDrill={addCustomDrill}
            onRemoveCustomDrill={removeCustomDrill}
          />
        )}

        {activeTab === "nutrition" && (
          <NutritionView
            state={state}
            onSelectNutritionGoal={setNutritionGoal}
            onToggleHabit={toggleHabit}
            onResetHabits={resetDailyHabits}
            onToggleGroceryItem={toggleGroceryItem}
          />
        )}

        {activeTab === "strength" && (
          <StrengthTrackerView
            state={state}
            onSetLiftGoal={setLiftGoal}
            onAddLiftLog={addLiftLog}
            onRemoveLiftLog={removeLiftLog}
          />
        )}

        {activeTab === "speed" && (
          <SpeedTrackerView
            state={state}
            onSetSpeedGoal={setSpeedGoal}
            onAddSpeedLog={addSpeedLog}
            onRemoveSpeedLog={removeSpeedLog}
          />
        )}
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        state={state}
        onClose={() => setSettingsOpen(false)}
        onUpdateProfile={updateAthleteProfile}
        onExportJson={exportStateJson}
        onImportJson={importStateJson}
        onResetAll={resetAllData}
      />
    </div>
  );
}

export default App;
