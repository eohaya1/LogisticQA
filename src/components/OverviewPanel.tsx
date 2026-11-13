import {
  Apple,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Target,
} from "lucide-react";
import {
  computeProgramSummaryMetrics,
  computeWorkoutCompletion,
} from "../domain/programSelectors";
import type {
  ActiveTab,
  ProgramData,
  ProgressState,
  WorkoutCategoryId,
} from "../domain/types";
import { CATEGORY_META } from "./categoryMeta";

interface OverviewPanelProps {
  program: ProgramData;
  progress: ProgressState;
  onOpenWorkoutCategory: (categoryId: WorkoutCategoryId) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export function OverviewPanel({
  program,
  progress,
  onOpenWorkoutCategory,
  onNavigateTab,
}: OverviewPanelProps) {
  const metrics = computeProgramSummaryMetrics(program, progress.customDrills);
  const completedExerciseSet = new Set(progress.completedExerciseIds);
  const completedHabitSet = new Set(progress.completedHabitIds);

  return (
    <div className="space-y-8">
      <section aria-labelledby="overview-metrics-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2
            id="overview-metrics-heading"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            Initial Program Overview
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            Ready for your review &amp; tweaks
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Training Pillars
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {metrics.workoutPillarCount}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Upper, Lower, Explosive, Running
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Exercises &amp; Sets
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {metrics.totalExercisesCount}{" "}
              <span className="text-sm font-semibold text-slate-500">
                ({metrics.totalSetsCount} sets)
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Every lift includes sets, reps &amp; rest
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Eating Habits
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {completedHabitSet.size} / {metrics.nutritionHabitsCount}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Daily habits checked off today
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Drills Staging
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {metrics.drillCategoriesCount}{" "}
              <span className="text-sm font-semibold text-slate-500">
                buckets
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {metrics.customDrillsCount > 0
                ? `${metrics.customDrillsCount} custom drill(s) added`
                : `${metrics.plannedDrillSlotsCount} slots staged to add later`}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="weekly-split-heading">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2
            id="weekly-split-heading"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            Recommended High School Weekly Split
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {program.weeklySchedule.map((slot) => {
            const meta = CATEGORY_META[slot.categoryId];
            const isWorkout = slot.categoryId !== "recovery";

            if (!isWorkout) {
              return (
                <button
                  key={slot.day}
                  type="button"
                  onClick={() => onNavigateTab("nutrition")}
                  className="flex flex-col items-start justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-sky-400 hover:bg-sky-50/40 min-h-[108px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {slot.day}
                  </span>
                  <div className="mt-2">
                    <p className="text-sm font-bold text-slate-900">
                      {slot.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {slot.duration}
                    </p>
                  </div>
                </button>
              );
            }

            const workoutCategoryId = slot.categoryId as WorkoutCategoryId;
            return (
              <button
                key={slot.day}
                type="button"
                onClick={() => onOpenWorkoutCategory(workoutCategoryId)}
                className="flex flex-col items-start justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-amber-500 hover:shadow-sm min-h-[108px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {slot.day}
                  </span>
                  <meta.Icon
                    className="h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-bold text-slate-900">
                    {slot.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {slot.duration}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="pillars-overview-heading">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2
            id="pillars-overview-heading"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            Workout Pillars (Sets &amp; Reps Overview)
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab("workouts")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Open Full Workout Tracker
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {program.workouts.map((workout) => {
            const meta = CATEGORY_META[workout.id];
            const stats = computeWorkoutCompletion(
              workout,
              completedExerciseSet,
            );

            return (
              <article
                key={workout.id}
                className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs ${meta.accentBorderClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.iconBgClass}`}
                      >
                        <meta.Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {workout.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-600">
                          {workout.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 shrink-0">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />~
                      {workout.estimatedMinutes} min
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">{workout.focus}</p>

                  <ul className="mt-4 divide-y divide-slate-100 border-t border-b border-slate-100">
                    {workout.exercises.map((exercise) => {
                      const isDone = completedExerciseSet.has(exercise.id);
                      return (
                        <li
                          key={exercise.id}
                          className="flex items-center justify-between gap-3 py-2 text-sm"
                        >
                          <span className="flex items-center gap-2 font-medium text-slate-800">
                            {isDone && (
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-600 shrink-0"
                                aria-label="Completed"
                              />
                            )}
                            <span>{exercise.name}</span>
                          </span>
                          <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-800">
                            {exercise.sets} × {exercise.reps}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    {stats.completedCount} of {stats.totalCount} completed (
                    {stats.percentComplete}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenWorkoutCategory(workout.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  >
                    Inspect {workout.title}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section
          aria-labelledby="nutrition-snapshot-heading"
          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Apple className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="nutrition-snapshot-heading"
                    className="text-base font-bold text-slate-900"
                  >
                    Healthy Eating Habits
                  </h2>
                  <p className="text-xs text-slate-600">
                    Fuel for clean trench mass &amp; fast recovery
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                {completedHabitSet.size}/{program.nutrition.habits.length} today
              </span>
            </div>

            <ul className="mt-4 space-y-2">
              {program.nutrition.habits.slice(0, 4).map((habit) => (
                <li
                  key={habit.id}
                  className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-800">
                    {habit.title}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {habit.timing}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateTab("nutrition")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              View All {program.nutrition.habits.length} Habits &amp; Meal Plan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section
          aria-labelledby="drills-snapshot-heading"
          className="flex flex-col justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-5"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-white">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="drills-snapshot-heading"
                    className="text-base font-bold text-slate-900"
                  >
                    Position Drills (Add Later)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Staged categories ready for your DL drills
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-300">
                Planned — Ready to Add
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-700">
              {program.drills.note}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {program.drills.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-lg border border-amber-200 bg-white px-3 py-2.5"
                >
                  <p className="text-sm font-bold text-slate-900">
                    {cat.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {cat.plannedSlots.length} starter slots staged
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateTab("drills")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Preview &amp; Manage Drills Slot
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
