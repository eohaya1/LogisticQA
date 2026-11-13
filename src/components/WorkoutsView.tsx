import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { getPhaseForWeek } from "../domain/calculations";
import {
  offseasonProgram,
  phaseByWeekNumber,
  workoutDayById,
} from "../data/programRepository";
import type {
  AthleteTrackerState,
  WorkoutCategoryId,
} from "../types/program";

interface WorkoutsViewProps {
  state: AthleteTrackerState;
  selectedDayId: WorkoutCategoryId;
  onSelectDayId: (dayId: WorkoutCategoryId) => void;
  onToggleWorkoutCompletion: (weekNumber: number, dayId: WorkoutCategoryId) => void;
  onAddCustomDrill: (input: {
    dayId: WorkoutCategoryId;
    name: string;
    sets: string;
    repsOrDuration: string;
    coachingCue: string;
  }) => void;
  onRemoveCustomDrill: (drillId: string) => void;
}

export function WorkoutsView({
  state,
  selectedDayId,
  onSelectDayId,
  onToggleWorkoutCompletion,
  onAddCustomDrill,
  onRemoveCustomDrill,
}: WorkoutsViewProps) {
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [drillName, setDrillName] = useState("");
  const [drillSets, setDrillSets] = useState("3");
  const [drillReps, setDrillReps] = useState("5 reps / side");
  const [drillCue, setDrillCue] = useState("");
  const [drillError, setDrillError] = useState<string | null>(null);

  const activePhase = getPhaseForWeek(
    state.currentWeek,
    phaseByWeekNumber,
    offseasonProgram.phases
  );

  const activeDay =
    workoutDayById.get(selectedDayId) ?? offseasonProgram.workoutDays[0]!;

  const isCompleted = state.workoutCompletions.some(
    (item) =>
      item.weekNumber === state.currentWeek && item.dayId === activeDay.id
  );

  const dayDrills = state.customDrills.filter(
    (drill) => drill.dayId === activeDay.id
  );

  function handleDrillSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = drillName.trim();
    if (trimmedName.length < 2) {
      setDrillError("Enter a drill name (at least 2 characters).");
      return;
    }
    if (drillSets.trim() === "" || drillReps.trim() === "") {
      setDrillError("Enter both sets and reps/duration.");
      return;
    }

    onAddCustomDrill({
      dayId: activeDay.id,
      name: trimmedName,
      sets: drillSets.trim(),
      repsOrDuration: drillReps.trim(),
      coachingCue: drillCue.trim() || "Coach cue pending",
    });

    setDrillName("");
    setDrillSets("3");
    setDrillReps("5 reps / side");
    setDrillCue("");
    setDrillError(null);
    setShowDrillForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Category Selector Tabs */}
      <div
        role="tablist"
        aria-label="Workout day categories"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {offseasonProgram.workoutDays.map((day) => {
          const isSelected = day.id === activeDay.id;
          const done = state.workoutCompletions.some(
            (c) => c.weekNumber === state.currentWeek && c.dayId === day.id
          );
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectDayId(day.id)}
              className={`flex min-h-[48px] flex-col items-start justify-center rounded-xl border px-3.5 py-2 text-left transition ${
                isSelected
                  ? "border-amber-600 bg-slate-900 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">
                <span>Day {day.dayNumber}</span>
                {done && (
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${
                      isSelected ? "text-emerald-400" : "text-emerald-600"
                    }`}
                    aria-label="Completed"
                  />
                )}
              </div>
              <span className="text-sm font-bold">{day.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Active Workout Header & Completion CTA */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-900">
                Week {state.currentWeek} • {activePhase.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                <Clock className="h-3.5 w-3.5" aria-hidden />~
                {activeDay.durationMinutes} min
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeDay.title}
            </h2>
            <p className="text-sm text-slate-600">{activeDay.primaryGoal}</p>
            <p className="text-xs font-medium text-slate-500">
              Phase intensity rule: {activePhase.rpeTarget} —{" "}
              {activePhase.coachingNote}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onToggleWorkoutCompletion(state.currentWeek, activeDay.id)
            }
            className={`inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              isCompleted
                ? "border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {isCompleted
              ? `Completed (Week ${state.currentWeek})`
              : `Mark Week ${state.currentWeek} Complete`}
          </button>
        </div>

        {/* Warm-up */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Dynamic Warm-Up (8–10 min)
          </h3>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
            {activeDay.warmUp.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exercises List with Sets / Reps / Rest */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Main Work — Sets, Reps & Coaching Cues ({activePhase.weeksLabel})
            </h3>
          </div>

          <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
            {activeDay.exercises.map((exercise, index) => {
              const rx = exercise.prescriptionsByPhase[activePhase.id];
              return (
                <article
                  key={exercise.id}
                  className="bg-white p-4 transition hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white tabular-nums">
                          {index + 1}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {exercise.name}
                        </h4>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {exercise.equipment}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-800">
                        D-Line Transfer: {exercise.dLineTransfer}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">
                          Cue:
                        </span>{" "}
                        {exercise.coachingCue}
                      </p>
                      <p className="text-xs text-slate-500">
                        Sub if equipment busy: {exercise.alternative}
                      </p>
                    </div>

                    <div className="grid shrink-0 grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center md:min-w-[260px]">
                      <div>
                        <div className="text-[11px] font-semibold uppercase text-slate-500">
                          Sets
                        </div>
                        <div className="text-base font-bold tabular-nums text-slate-900">
                          {rx.sets}
                        </div>
                      </div>
                      <div className="border-x border-slate-200 px-2">
                        <div className="text-[11px] font-semibold uppercase text-slate-500">
                          Reps / Dist
                        </div>
                        <div className="text-base font-bold tabular-nums text-slate-900">
                          {rx.reps}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase text-slate-500">
                          Rest
                        </div>
                        <div className="text-base font-bold tabular-nums text-slate-900">
                          {rx.rest}
                        </div>
                      </div>
                      <div className="col-span-3 border-t border-slate-200 pt-1.5 text-xs font-medium text-slate-700">
                        {rx.intensityCue}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Dedicated Drills Slot (Ready for User's Drills Later + Custom Add) */}
        <div className="mt-6 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                <Info className="h-4 w-4" aria-hidden />
                Position Drills Slot (Extensible)
              </div>
              <h3 className="mt-1 text-base font-bold text-slate-900">
                {activeDay.drillSlot.title}
              </h3>
              <p className="mt-0.5 text-sm text-slate-600">
                {activeDay.drillSlot.description} Timing:{" "}
                <span className="font-medium text-slate-800">
                  {activeDay.drillSlot.suggestedTiming}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDrillForm((prev) => !prev)}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-amber-700 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {showDrillForm ? "Cancel" : "Add Drill"}
            </button>
          </div>

          {showDrillForm && (
            <form
              onSubmit={handleDrillSubmit}
              className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-amber-200 bg-white p-4 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Drill Name
                  <input
                    type="text"
                    value={drillName}
                    onChange={(e) => setDrillName(e.target.value)}
                    placeholder="e.g., 2-Point Punch & Rip on Bag"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-700">
                Sets
                <input
                  type="text"
                  value={drillSets}
                  onChange={(e) => setDrillSets(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Reps / Duration
                <input
                  type="text"
                  value={drillReps}
                  onChange={(e) => setDrillReps(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Coaching Cue (Optional)
                  <input
                    type="text"
                    value={drillCue}
                    onChange={(e) => setDrillCue(e.target.value)}
                    placeholder="e.g., Shoot thumbs up, clear hip tight to the bag"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              {drillError && (
                <p className="sm:col-span-2 text-xs font-semibold text-red-700">
                  {drillError}
                </p>
              )}
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Save Drill to {activeDay.shortLabel}
                </button>
              </div>
            </form>
          )}

          {dayDrills.length === 0 ? (
            <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-600">
              No drills added yet for {activeDay.shortLabel}. Leave this open for
              the drills you&apos;ll add next, or click &ldquo;Add Drill&rdquo; to attach
              your own right now.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dayDrills.map((drill) => (
                <li
                  key={drill.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white px-3.5 py-2.5"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {drill.name}{" "}
                      <span className="ml-2 text-xs font-semibold tabular-nums text-amber-800">
                        {drill.sets} × {drill.repsOrDuration}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {drill.coachingCue}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete drill ${drill.name}`}
                    onClick={() => onRemoveCustomDrill(drill.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cool-down */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            3. Cool-Down & Recovery
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {activeDay.coolDown.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
