import { CheckCircle2, Circle, Clock, RotateCcw } from "lucide-react";
import {
  computeWorkoutCompletion,
  filterWorkoutsByCategory,
} from "../domain/programSelectors";
import type { WorkoutCategoryId, WorkoutDay } from "../domain/types";
import { CATEGORY_META } from "./categoryMeta";

interface WorkoutsPanelProps {
  workouts: WorkoutDay[];
  selectedCategory: WorkoutCategoryId | "all";
  completedExerciseIds: string[];
  onSelectCategory: (category: WorkoutCategoryId | "all") => void;
  onToggleExercise: (exerciseId: string) => void;
  onMarkDayComplete: (workout: WorkoutDay) => void;
  onResetDayProgress: (workout: WorkoutDay) => void;
}

const FILTER_OPTIONS: Array<{ id: WorkoutCategoryId | "all"; label: string }> = [
  { id: "all", label: "All 4 Pillars" },
  { id: "upper-body", label: "Upper Body" },
  { id: "lower-body", label: "Lower Body" },
  { id: "explosive", label: "Explosive Days" },
  { id: "running", label: "Running Days" },
];

export function WorkoutsPanel({
  workouts,
  selectedCategory,
  completedExerciseIds,
  onSelectCategory,
  onToggleExercise,
  onMarkDayComplete,
  onResetDayProgress,
}: WorkoutsPanelProps) {
  const completedSet = new Set(completedExerciseIds);
  const visibleWorkouts = filterWorkoutsByCategory(workouts, selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Workouts, Sets &amp; Reps
          </h2>
          <p className="text-sm text-slate-600">
            Filter by training pillar and check off exercises as you complete
            your session.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filter workouts by training pillar"
          className="flex flex-wrap gap-2"
        >
          {FILTER_OPTIONS.map((option) => {
            const isActive = selectedCategory === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectCategory(option.id)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {visibleWorkouts.map((workout) => {
          const meta = CATEGORY_META[workout.id];
          const stats = computeWorkoutCompletion(workout, completedSet);
          const isDayComplete =
            stats.totalCount > 0 && stats.completedCount === stats.totalCount;

          return (
            <section
              key={workout.id}
              aria-labelledby={`workout-heading-${workout.id}`}
              className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs ${meta.accentBorderClass}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${meta.iconBgClass}`}
                  >
                    <meta.Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        id={`workout-heading-${workout.id}`}
                        className="text-lg font-bold text-slate-900"
                      >
                        {workout.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                      >
                        {meta.badgeText}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-slate-700">
                      {workout.subtitle}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {workout.focus}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />~
                      {workout.estimatedMinutes} min
                    </span>
                    <span>
                      Suggested: {workout.recommendedDays.join(" / ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {stats.completedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onResetDayProgress(workout)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        Reset Day
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isDayComplete}
                      onClick={() => onMarkDayComplete(workout)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                        isDayComplete
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                          : "bg-amber-600 text-white hover:bg-amber-700"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {isDayComplete
                        ? "Session Completed"
                        : "Complete All Exercises"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>
                    Progress: {stats.completedCount} / {stats.totalCount}{" "}
                    exercises
                  </span>
                  <span>{stats.percentComplete}%</span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={stats.percentComplete}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${workout.title} completion`}
                >
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${stats.percentComplete}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {workout.exercises.map((exercise) => {
                  const isChecked = completedSet.has(exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`rounded-xl border p-4 transition ${
                        isChecked
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleExercise(exercise.id)}
                          aria-pressed={isChecked}
                          className="flex flex-1 items-start gap-3 text-left min-h-[44px] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                        >
                          {isChecked ? (
                            <CheckCircle2
                              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle
                              className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
                              aria-hidden="true"
                            />
                          )}
                          <div>
                            <p
                              className={`text-base font-bold ${
                                isChecked
                                  ? "text-emerald-950 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {exercise.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              <span className="font-semibold text-slate-700">
                                DL Cue:
                              </span>{" "}
                              {exercise.cue}
                            </p>
                          </div>
                        </button>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs font-bold text-white">
                            {exercise.sets} sets × {exercise.reps}
                          </span>
                          <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            Rest: {exercise.rest}
                          </span>
                          <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600">
                            {exercise.intensity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
