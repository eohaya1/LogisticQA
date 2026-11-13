import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Flame,
  Gauge,
  Utensils,
  Zap,
} from "lucide-react";
import {
  computeDailyMealPlanCost,
  computeOffseasonCompletionStats,
  getPhaseForWeek,
} from "../domain/calculations";
import {
  nutritionConfig,
  offseasonProgram,
  phaseByWeekNumber,
  trackingConfig,
} from "../data/programRepository";
import type { AthleteTrackerState, WorkoutCategoryId } from "../types/program";

export type AppTab =
  | "overview"
  | "workouts"
  | "nutrition"
  | "strength"
  | "speed";

interface OverviewViewProps {
  state: AthleteTrackerState;
  onNavigateTab: (tab: AppTab) => void;
  onSelectWorkoutDay: (dayId: WorkoutCategoryId) => void;
}

const DAY_ICON_MAP: Record<WorkoutCategoryId, typeof Dumbbell> = {
  "upper-body": Dumbbell,
  "lower-body": Flame,
  explosive: Zap,
  running: Gauge,
};

export function OverviewView({
  state,
  onNavigateTab,
  onSelectWorkoutDay,
}: OverviewViewProps) {
  const activePhase = getPhaseForWeek(
    state.currentWeek,
    phaseByWeekNumber,
    offseasonProgram.phases
  );

  const completionStats = computeOffseasonCompletionStats(
    state.workoutCompletions,
    offseasonProgram.totalWeeks,
    offseasonProgram.workoutDays.length
  );

  const dailyMealCost = computeDailyMealPlanCost(nutritionConfig.mealSlots);
  const completedThisWeekCount = state.workoutCompletions.filter(
    (c) => c.weekNumber === state.currentWeek
  ).length;

  return (
    <div className="space-y-8">
      {/* Program Intro Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {offseasonProgram.seasonType} Program Overview • Week{" "}
              {state.currentWeek} of {offseasonProgram.totalWeeks}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {offseasonProgram.programName}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Built for{" "}
              <span className="font-semibold text-slate-800">
                {offseasonProgram.targetAthlete}
              </span>
              . {offseasonProgram.weeklyScheduleNote}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
            <button
              type="button"
              onClick={() => onNavigateTab("workouts")}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-700"
            >
              Open Week {state.currentWeek} Workouts
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <span className="text-xs text-slate-500">
              {completedThisWeekCount}/{offseasonProgram.workoutDays.length} days
              completed this week
            </span>
          </div>
        </div>

        {/* 12-Week Periodization Phases */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {offseasonProgram.phases.map((phase) => {
            const isActive = phase.id === activePhase.id;
            return (
              <div
                key={phase.id}
                className={`rounded-xl border p-4 transition ${
                  isActive
                    ? "border-amber-500 bg-amber-50/70"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {phase.weeksLabel}
                  </span>
                  {isActive && (
                    <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      Active Phase
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {phase.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {phase.focus}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-700">
                  Target: {phase.rpeTarget}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Day Weekly Split Overview */}
      <section aria-labelledby="weekly-split-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="weekly-split-heading"
              className="text-lg font-bold text-slate-900"
            >
              4-Day Offseason Training Split
            </h2>
            <p className="text-sm text-slate-600">
              Click any training day to view full sets, reps, rest intervals,
              coaching cues, and your drill slot.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Active prescriptions shown for {activePhase.weeksLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {offseasonProgram.workoutDays.map((day) => {
            const Icon = DAY_ICON_MAP[day.id];
            const isCompleted = state.workoutCompletions.some(
              (c) => c.weekNumber === state.currentWeek && c.dayId === day.id
            );
            const customDrillCount = state.customDrills.filter(
              (d) => d.dayId === day.id
            ).length;

            return (
              <div
                key={day.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Day {day.dayNumber} • ~{day.durationMinutes} min
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {day.shortLabel}
                        </h3>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        Done W{state.currentWeek}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Scheduled
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{day.subtitle}</p>

                  <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700">
                    {day.exercises.slice(0, 4).map((ex) => {
                      const rx = ex.prescriptionsByPhase[activePhase.id];
                      return (
                        <li
                          key={ex.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="truncate font-medium">
                            {ex.name}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                            {rx.sets} × {rx.reps}
                          </span>
                        </li>
                      );
                    })}
                    {day.exercises.length > 4 && (
                      <li className="text-slate-500">
                        + {day.exercises.length - 4} more exercises in full view
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">
                    {customDrillCount > 0
                      ? `${customDrillCount} custom drill(s) attached`
                      : "Drill slot ready for coach drills"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectWorkoutDay(day.id)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    View Day {day.dayNumber}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pillar Summary Cards: Drills Slot, Nutrition, Performance */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <Utensils className="h-5 w-5 text-emerald-600" aria-hidden />
              <h3 className="text-base font-bold">
                Affordable HS Meal Plan & Habits
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {nutritionConfig.habits.length} daily habits +{" "}
              {nutritionConfig.mealSlots.length} budget meals (~$
              {dailyMealCost.toFixed(2)}/day est.) using eggs, oats, rice,
              beans, chicken thighs, tuna & milk.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700">
              Today&apos;s habits checked:{" "}
              <span className="tabular-nums font-bold">
                {state.dailyHabitsCheckedIds.length}/
                {nutritionConfig.habits.length}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("nutrition")}
            className="mt-4 inline-flex min-h-[44px] items-center justify-between rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Open Meal Plan & Grocery List
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <Dumbbell className="h-5 w-5 text-amber-600" aria-hidden />
              <h3 className="text-base font-bold">
                Week-to-Week Lifting Goals
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Set Week 1 starting weights and Week 12 targets across{" "}
              {trackingConfig.lifts.length} core lifts, with automatic weekly
              5-lb progression targets and estimated 1RM tracking.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700">
              Logged lift sets:{" "}
              <span className="tabular-nums font-bold">
                {state.liftLogs.length}
              </span>{" "}
              • Offseason adherence:{" "}
              <span className="tabular-nums font-bold">
                {completionStats.percentComplete}%
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("strength")}
            className="mt-4 inline-flex min-h-[44px] items-center justify-between rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Track Lifting Goals
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <ClipboardList className="h-5 w-5 text-blue-600" aria-hidden />
              <h3 className="text-base font-bold">
                Speed, Agility & Drills Slot
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Track 10-yd get-off split, 40-yd dash, 5-10-5 shuttle, L-drill,
              and jumps. Every workout day also holds a dedicated slot for the
              position drills you&apos;ll add next.
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700">
              Speed tests logged:{" "}
              <span className="tabular-nums font-bold">
                {state.speedLogs.length}
              </span>{" "}
              • Custom drills:{" "}
              <span className="tabular-nums font-bold">
                {state.customDrills.length}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab("speed")}
            className="mt-4 inline-flex min-h-[44px] items-center justify-between rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Track Speed & Jumps
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </section>
    </div>
  );
}
