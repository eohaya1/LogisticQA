import { useMemo, useState, type FormEvent } from "react";
import { Award, Dumbbell, Target, Trash2 } from "lucide-react";
import {
  computeWeeklyLiftTarget,
  estimateOneRepMax,
  evaluateWeeklyLiftProgress,
  validatePositiveNumberInput,
  type WeeklyLiftStatus,
} from "../domain/calculations";
import {
  liftDefinitionById,
  offseasonProgram,
  trackingConfig,
} from "../data/programRepository";
import type { AthleteTrackerState, LiftGoal } from "../types/program";
import { SimpleTrendChart } from "./SimpleTrendChart";

interface StrengthTrackerViewProps {
  state: AthleteTrackerState;
  onSetLiftGoal: (goal: LiftGoal) => void;
  onAddLiftLog: (input: {
    liftId: string;
    weekNumber: number;
    weightLbs: number;
    sets: number;
    reps: number;
    notes?: string;
  }) => void;
  onRemoveLiftLog: (entryId: string) => void;
}

const STATUS_BADGE_MAP: Record<
  WeeklyLiftStatus,
  { label: string; className: string }
> = {
  ahead: {
    label: "Ahead of Goal",
    className: "bg-emerald-100 text-emerald-800",
  },
  "on-track": {
    label: "On Track",
    className: "bg-blue-100 text-blue-800",
  },
  behind: {
    label: "Below Target",
    className: "bg-amber-100 text-amber-900",
  },
  "not-logged": {
    label: "Not Logged",
    className: "bg-slate-100 text-slate-600",
  },
};

export function StrengthTrackerView({
  state,
  onSetLiftGoal,
  onAddLiftLog,
  onRemoveLiftLog,
}: StrengthTrackerViewProps) {
  const [selectedLiftId, setSelectedLiftId] = useState<string>(
    trackingConfig.lifts[0]?.id ?? "bench-press"
  );

  const activeLift =
    liftDefinitionById.get(selectedLiftId) ?? trackingConfig.lifts[0]!;
  const existingGoal = state.liftGoals[activeLift.id];

  // Goal Form State
  const [startWeightInput, setStartWeightInput] = useState(
    existingGoal ? String(existingGoal.startingWeightLbs) : ""
  );
  const [targetWeightInput, setTargetWeightInput] = useState(
    existingGoal ? String(existingGoal.targetEndWeightLbs) : ""
  );
  const [targetRepsInput, setTargetRepsInput] = useState(
    existingGoal ? String(existingGoal.targetReps) : "5"
  );
  const [goalError, setGoalError] = useState<string | null>(null);

  // Lift Log Form State
  const [logWeek, setLogWeek] = useState<number>(state.currentWeek);
  const [logWeightInput, setLogWeightInput] = useState("");
  const [logSetsInput, setLogSetsInput] = useState("4");
  const [logRepsInput, setLogRepsInput] = useState("5");
  const [logNotesInput, setLogNotesInput] = useState("");
  const [logError, setLogError] = useState<string | null>(null);

  function handleSelectLift(liftId: string) {
    setSelectedLiftId(liftId);
    const nextGoal = state.liftGoals[liftId];
    setStartWeightInput(nextGoal ? String(nextGoal.startingWeightLbs) : "");
    setTargetWeightInput(nextGoal ? String(nextGoal.targetEndWeightLbs) : "");
    setTargetRepsInput(nextGoal ? String(nextGoal.targetReps) : "5");
    setGoalError(null);
    setLogError(null);
  }

  function handleSaveGoal(event: FormEvent) {
    event.preventDefault();
    const startRes = validatePositiveNumberInput(
      startWeightInput,
      "Week 1 Starting Weight",
      20,
      1000
    );
    if (!startRes.ok) {
      setGoalError(startRes.error.message);
      return;
    }
    const targetRes = validatePositiveNumberInput(
      targetWeightInput,
      "Week 12 Target Weight",
      20,
      1200
    );
    if (!targetRes.ok) {
      setGoalError(targetRes.error.message);
      return;
    }
    const repsRes = validatePositiveNumberInput(
      targetRepsInput,
      "Target Reps",
      1,
      20
    );
    if (!repsRes.ok) {
      setGoalError(repsRes.error.message);
      return;
    }

    onSetLiftGoal({
      liftId: activeLift.id,
      startingWeightLbs: startRes.value,
      targetEndWeightLbs: targetRes.value,
      targetReps: Math.round(repsRes.value),
      totalWeeks: offseasonProgram.totalWeeks,
    });
    setGoalError(null);
  }

  function handleAddLog(event: FormEvent) {
    event.preventDefault();
    const weightRes = validatePositiveNumberInput(
      logWeightInput,
      "Weight (lbs)",
      10,
      1200
    );
    if (!weightRes.ok) {
      setLogError(weightRes.error.message);
      return;
    }
    const setsRes = validatePositiveNumberInput(logSetsInput, "Sets", 1, 20);
    if (!setsRes.ok) {
      setLogError(setsRes.error.message);
      return;
    }
    const repsRes = validatePositiveNumberInput(logRepsInput, "Reps", 1, 30);
    if (!repsRes.ok) {
      setLogError(repsRes.error.message);
      return;
    }

    onAddLiftLog({
      liftId: activeLift.id,
      weekNumber: logWeek,
      weightLbs: weightRes.value,
      sets: Math.round(setsRes.value),
      reps: Math.round(repsRes.value),
      notes: logNotesInput.trim() || undefined,
    });

    setLogWeightInput("");
    setLogNotesInput("");
    setLogError(null);
  }

  const liftLogsForSelected = useMemo(
    () => state.liftLogs.filter((entry) => entry.liftId === activeLift.id),
    [state.liftLogs, activeLift.id]
  );

  const weekRows = useMemo(() => {
    const rows = [];
    for (let wk = 1; wk <= offseasonProgram.totalWeeks; wk += 1) {
      rows.push(
        evaluateWeeklyLiftProgress(existingGoal, liftLogsForSelected, wk)
      );
    }
    return rows;
  }, [existingGoal, liftLogsForSelected]);

  const personalBest1RM = useMemo(() => {
    if (liftLogsForSelected.length === 0) return null;
    let best = 0;
    for (const entry of liftLogsForSelected) {
      const e1rm = estimateOneRepMax(entry.weightLbs, entry.reps);
      if (e1rm.ok && e1rm.value > best) {
        best = e1rm.value;
      }
    }
    return best > 0 ? best : null;
  }, [liftLogsForSelected]);

  const chartPoints = weekRows.map((row) => ({
    weekNumber: row.weekNumber,
    actualValue: row.bestLoggedWeightLbs,
    targetValue: row.targetWeightLbs,
  }));

  const currentWeekTarget = existingGoal
    ? computeWeeklyLiftTarget(existingGoal, state.currentWeek)
    : null;

  return (
    <div className="space-y-6">
      {/* Lift Selector */}
      <div
        role="tablist"
        aria-label="Tracked core lifts"
        className="flex flex-wrap gap-2"
      >
        {trackingConfig.lifts.map((lift) => {
          const selected = lift.id === activeLift.id;
          return (
            <button
              key={lift.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => handleSelectLift(lift.id)}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-amber-600 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              {lift.name}
            </button>
          );
        })}
      </div>

      {/* Top Grid: Week-to-Week Goal Setup + Log Performance Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form 1: Set 12-Week Lifting Goal */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Target className="h-5 w-5 text-amber-600" aria-hidden />
              12-Week Goal Ramp — {activeLift.name}
            </h2>
            {personalBest1RM !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-emerald-800">
                <Award className="h-3.5 w-3.5" aria-hidden />
                Best Est. 1RM: {personalBest1RM} lbs
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Enter your Week 1 working weight and your Week 12 offseason goal.
            We compute a 5-lb plate target for every week in between.
          </p>

          <form onSubmit={handleSaveGoal} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block text-xs font-semibold text-slate-700">
                Week 1 Start (lbs)
                <input
                  type="number"
                  step="5"
                  min="20"
                  value={startWeightInput}
                  onChange={(e) => setStartWeightInput(e.target.value)}
                  placeholder="e.g. 155"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Week 12 Goal (lbs)
                <input
                  type="number"
                  step="5"
                  min="20"
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                  placeholder="e.g. 205"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Target Reps
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={targetRepsInput}
                  onChange={(e) => setTargetRepsInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
            </div>

            {goalError && (
              <p className="text-xs font-semibold text-red-700">{goalError}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-600">
                {currentWeekTarget && currentWeekTarget.ok
                  ? `Week ${state.currentWeek} Target: ${currentWeekTarget.value} lbs × ${existingGoal?.targetReps} reps`
                  : "No goal set yet for this lift."}
              </span>
              <button
                type="submit"
                className="min-h-[44px] rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save Lifting Goal
              </button>
            </div>
          </form>
        </section>

        {/* Form 2: Log Lift Session */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Dumbbell className="h-5 w-5 text-amber-600" aria-hidden />
            Log Working Set — {activeLift.name}
          </h2>
          <p className="mt-1 text-xs text-slate-600">{activeLift.notes}</p>

          <form onSubmit={handleAddLog} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block text-xs font-semibold text-slate-700">
                Week
                <select
                  value={logWeek}
                  onChange={(e) => setLogWeek(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm tabular-nums"
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
              <label className="block text-xs font-semibold text-slate-700">
                Weight (lbs)
                <input
                  type="number"
                  step="2.5"
                  min="10"
                  value={logWeightInput}
                  onChange={(e) => setLogWeightInput(e.target.value)}
                  placeholder="e.g. 165"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Sets
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={logSetsInput}
                  onChange={(e) => setLogSetsInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Reps
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={logRepsInput}
                  onChange={(e) => setLogRepsInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Notes (Optional — bar speed, depth, felt heavy/light)
              <input
                type="text"
                value={logNotesInput}
                onChange={(e) => setLogNotesInput(e.target.value)}
                placeholder="e.g., Bar moved fast, ready to bump +5 lbs next week"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            {logError && (
              <p className="text-xs font-semibold text-red-700">{logError}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Log Lift Result
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Trend Chart */}
      <SimpleTrendChart
        title={activeLift.name}
        unitLabel="lbs"
        points={chartPoints}
      />

      {/* Week-by-Week Comparison Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Week-to-Week Progression Table ({activeLift.name})
          </h3>
          <p className="text-xs text-slate-600">
            Compares your weekly target weight against your heaviest working set
            each week.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-4 py-3">Week</th>
                <th className="px-4 py-3">Target Weight</th>
                <th className="px-4 py-3">Best Logged</th>
                <th className="px-4 py-3">Est. 1RM</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weekRows.map((row) => {
                const badge = STATUS_BADGE_MAP[row.status];
                const isActiveWeek = row.weekNumber === state.currentWeek;
                return (
                  <tr
                    key={row.weekNumber}
                    className={isActiveWeek ? "bg-amber-50/50" : "bg-white"}
                  >
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900">
                      Week {row.weekNumber}
                      {isActiveWeek && (
                        <span className="ml-2 text-[11px] font-bold text-amber-700">
                          (Current)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-700">
                      {row.targetWeightLbs !== null
                        ? `${row.targetWeightLbs} lbs`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums text-slate-900">
                      {row.bestLoggedWeightLbs !== null
                        ? `${row.bestLoggedWeightLbs} lbs × ${row.bestLoggedReps}`
                        : "Not logged"}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-slate-700">
                      {row.bestEstimated1RM !== null
                        ? `${row.bestEstimated1RM} lbs`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Logged Entries History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          Logged Sessions — {activeLift.name}
        </h3>
        {liftLogsForSelected.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No sessions logged for {activeLift.name} yet. Log your first set
            above to start tracking weekly progress.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {liftLogsForSelected.map((entry) => {
              const e1rm = estimateOneRepMax(entry.weightLbs, entry.reps);
              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      Week {entry.weekNumber}: {entry.weightLbs} lbs —{" "}
                      {entry.sets} sets × {entry.reps} reps
                      {e1rm.ok && (
                        <span className="ml-2 text-xs font-medium text-slate-500">
                          (Est. 1RM: {e1rm.value} lbs)
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="text-xs text-slate-600">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete Week ${entry.weekNumber} ${activeLift.name} entry`}
                    onClick={() => onRemoveLiftLog(entry.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
