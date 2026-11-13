import { useMemo, useState, type FormEvent } from "react";
import { Award, Gauge, Target, Trash2 } from "lucide-react";
import {
  isBetterMetricValue,
  summarizeSpeedMetric,
  validatePositiveNumberInput,
} from "../domain/calculations";
import {
  offseasonProgram,
  speedMetricById,
  trackingConfig,
} from "../data/programRepository";
import type {
  AthleteTrackerState,
  SpeedGoal,
  SpeedLogEntry,
} from "../types/program";
import { SimpleTrendChart } from "./SimpleTrendChart";

interface SpeedTrackerViewProps {
  state: AthleteTrackerState;
  onSetSpeedGoal: (goal: SpeedGoal) => void;
  onAddSpeedLog: (input: {
    metricId: string;
    weekNumber: number;
    value: number;
    surface: SpeedLogEntry["surface"];
    notes?: string;
  }) => void;
  onRemoveSpeedLog: (entryId: string) => void;
}

export function SpeedTrackerView({
  state,
  onSetSpeedGoal,
  onAddSpeedLog,
  onRemoveSpeedLog,
}: SpeedTrackerViewProps) {
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    trackingConfig.speedMetrics[0]?.id ?? "10-yd-split"
  );

  const activeMetric =
    speedMetricById.get(selectedMetricId) ?? trackingConfig.speedMetrics[0]!;
  const existingGoal = state.speedGoals[activeMetric.id];

  // Goal Form State
  const [baselineInput, setBaselineInput] = useState(
    existingGoal ? String(existingGoal.baselineValue) : ""
  );
  const [targetInput, setTargetInput] = useState(
    existingGoal ? String(existingGoal.targetValue) : ""
  );
  const [goalError, setGoalError] = useState<string | null>(null);

  // Speed Attempt Form State
  const [logWeek, setLogWeek] = useState<number>(state.currentWeek);
  const [logValueInput, setLogValueInput] = useState("");
  const [logSurface, setLogSurface] =
    useState<SpeedLogEntry["surface"]>("turf");
  const [logNotes, setLogNotes] = useState("");
  const [logError, setLogError] = useState<string | null>(null);

  function handleSelectMetric(metricId: string) {
    setSelectedMetricId(metricId);
    const nextGoal = state.speedGoals[metricId];
    setBaselineInput(nextGoal ? String(nextGoal.baselineValue) : "");
    setTargetInput(nextGoal ? String(nextGoal.targetValue) : "");
    setGoalError(null);
    setLogError(null);
  }

  function handleSaveGoal(event: FormEvent) {
    event.preventDefault();
    const maxAllowed = activeMetric.unit === "sec" ? 30 : 200;
    const baseRes = validatePositiveNumberInput(
      baselineInput,
      `Baseline (${activeMetric.unit})`,
      0.5,
      maxAllowed
    );
    if (!baseRes.ok) {
      setGoalError(baseRes.error.message);
      return;
    }
    const targetRes = validatePositiveNumberInput(
      targetInput,
      `Offseason Goal (${activeMetric.unit})`,
      0.5,
      maxAllowed
    );
    if (!targetRes.ok) {
      setGoalError(targetRes.error.message);
      return;
    }

    onSetSpeedGoal({
      metricId: activeMetric.id,
      baselineValue: baseRes.value,
      targetValue: targetRes.value,
    });
    setGoalError(null);
  }

  function handleAddSpeedLog(event: FormEvent) {
    event.preventDefault();
    const maxAllowed = activeMetric.unit === "sec" ? 30 : 200;
    const valRes = validatePositiveNumberInput(
      logValueInput,
      `Result (${activeMetric.unit})`,
      0.5,
      maxAllowed
    );
    if (!valRes.ok) {
      setLogError(valRes.error.message);
      return;
    }

    onAddSpeedLog({
      metricId: activeMetric.id,
      weekNumber: logWeek,
      value: valRes.value,
      surface: logSurface,
      notes: logNotes.trim() || undefined,
    });
    setLogValueInput("");
    setLogNotes("");
    setLogError(null);
  }

  const logsForMetric = useMemo(
    () => state.speedLogs.filter((entry) => entry.metricId === activeMetric.id),
    [state.speedLogs, activeMetric.id]
  );

  const summary = useMemo(
    () => summarizeSpeedMetric(activeMetric, existingGoal, logsForMetric),
    [activeMetric, existingGoal, logsForMetric]
  );

  const chartPoints = useMemo(() => {
    const bestByWeek = new Map<number, number>();
    for (const entry of logsForMetric) {
      const existing = bestByWeek.get(entry.weekNumber);
      if (
        existing === undefined ||
        isBetterMetricValue(entry.value, existing, activeMetric.direction)
      ) {
        bestByWeek.set(entry.weekNumber, entry.value);
      }
    }

    return Array.from(
      { length: offseasonProgram.totalWeeks },
      (_, idx) => idx + 1
    ).map((wk) => ({
      weekNumber: wk,
      actualValue: bestByWeek.get(wk) ?? null,
      targetValue: existingGoal ? existingGoal.targetValue : null,
    }));
  }, [logsForMetric, activeMetric.direction, existingGoal]);

  return (
    <div className="space-y-6">
      {/* Metric Selector Tabs */}
      <div
        role="tablist"
        aria-label="Speed and combine metrics"
        className="flex flex-wrap gap-2"
      >
        {trackingConfig.speedMetrics.map((metric) => {
          const selected = metric.id === activeMetric.id;
          return (
            <button
              key={metric.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => handleSelectMetric(metric.id)}
              className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-amber-600 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              {metric.name}
            </button>
          );
        })}
      </div>

      {/* Summary Banner */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Personal Best (PR)
          </div>
          <div className="mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums text-slate-900">
            {summary.personalBest !== null
              ? `${summary.personalBest.value} ${activeMetric.unit}`
              : "Not logged"}
            {summary.goalMet && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                <Award className="h-3.5 w-3.5" aria-hidden />
                Goal Hit
              </span>
            )}
          </div>
          {summary.personalBest && (
            <div className="mt-0.5 text-xs text-slate-500">
              Week {summary.personalBest.weekNumber} •{" "}
              {summary.personalBest.surface}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Change vs Baseline
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {summary.deltaFromBaseline !== null
              ? `${summary.deltaFromBaseline > 0 ? "+" : ""}${summary.deltaFromBaseline} ${activeMetric.unit}`
              : "—"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {summary.isImprovedVsBaseline === true
              ? "Improved over baseline"
              : summary.isImprovedVsBaseline === false
                ? "Working toward baseline"
                : "Set baseline & log test to compare"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Target & Direction
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {existingGoal
              ? `${existingGoal.targetValue} ${activeMetric.unit}`
              : "No goal set"}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {activeMetric.direction === "lower-is-better"
              ? "Lower time = faster"
              : "Higher distance/height = more power"}
          </div>
        </div>
      </section>

      {/* Goal + Attempt Forms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Target className="h-5 w-5 text-amber-600" aria-hidden />
            Baseline & Goal — {activeMetric.name}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {activeMetric.dLineBenchmarkNote}
          </p>

          <form onSubmit={handleSaveGoal} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700">
                Week 1 Baseline ({activeMetric.unit})
                <input
                  type="number"
                  step="0.01"
                  value={baselineInput}
                  onChange={(e) => setBaselineInput(e.target.value)}
                  placeholder={activeMetric.unit === "sec" ? "e.g. 5.15" : "e.g. 88"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Offseason Goal ({activeMetric.unit})
                <input
                  type="number"
                  step="0.01"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder={activeMetric.unit === "sec" ? "e.g. 4.88" : "e.g. 96"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
            </div>
            {goalError && (
              <p className="text-xs font-semibold text-red-700">{goalError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save Speed Goal
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Gauge className="h-5 w-5 text-amber-600" aria-hidden />
            Log Timed Test — {activeMetric.name}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Always record surface conditions (turf, grass, track) so week-to-week
            comparisons stay honest.
          </p>

          <form onSubmit={handleAddSpeedLog} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                Result ({activeMetric.unit})
                <input
                  type="number"
                  step="0.01"
                  value={logValueInput}
                  onChange={(e) => setLogValueInput(e.target.value)}
                  placeholder={activeMetric.unit === "sec" ? "e.g. 5.02" : "e.g. 92"}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Surface
                <select
                  value={logSurface}
                  onChange={(e) =>
                    setLogSurface(e.target.value as SpeedLogEntry["surface"])
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
                >
                  <option value="turf">Turf</option>
                  <option value="grass">Grass</option>
                  <option value="track">Track</option>
                  <option value="gym">Gym / Mat</option>
                </select>
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Notes (Optional — hand-timed vs laser, cleats vs sneakers)
              <input
                type="text"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="e.g., Laser timed in cleats, zero wind"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            {logError && (
              <p className="text-xs font-semibold text-red-700">{logError}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-[44px] rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Log Speed Result
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Trend Chart */}
      <SimpleTrendChart
        title={activeMetric.name}
        unitLabel={activeMetric.unit}
        points={chartPoints}
        direction={activeMetric.direction}
      />

      {/* History */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          Logged Tests — {activeMetric.name}
        </h3>
        {logsForMetric.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No {activeMetric.name} attempts logged yet. Log your Week{" "}
            {state.currentWeek} result above.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {logsForMetric.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <div className="text-sm font-bold tabular-nums text-slate-900">
                    Week {entry.weekNumber}: {entry.value} {activeMetric.unit}
                    <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                      {entry.surface}
                    </span>
                  </div>
                  {entry.notes && (
                    <div className="text-xs text-slate-600">{entry.notes}</div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Delete Week ${entry.weekNumber} ${activeMetric.name} log`}
                  onClick={() => onRemoveSpeedLog(entry.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
