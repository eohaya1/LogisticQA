import { Apple, CheckCircle2, Circle, RotateCcw, Utensils } from "lucide-react";
import type { NutritionGuide } from "../domain/types";

interface NutritionPanelProps {
  nutrition: NutritionGuide;
  completedHabitIds: string[];
  onToggleHabit: (habitId: string) => void;
  onResetHabits: () => void;
}

export function NutritionPanel({
  nutrition,
  completedHabitIds,
  onToggleHabit,
  onResetHabits,
}: NutritionPanelProps) {
  const completedSet = new Set(completedHabitIds);
  const completedCount = nutrition.habits.filter((h) =>
    completedSet.has(h.id),
  ).length;
  const totalHabits = nutrition.habits.length;
  const percent =
    totalHabits === 0 ? 0 : Math.round((completedCount / totalHabits) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            {nutrition.title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            {nutrition.summary}
          </p>
        </div>

        {completedCount > 0 && (
          <button
            type="button"
            onClick={onResetHabits}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset Daily Check-In
          </button>
        )}
      </div>

      <section
        aria-labelledby="daily-habits-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Apple className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="daily-habits-heading"
                className="text-base font-bold text-slate-900"
              >
                Daily Non-Negotiable Habits
              </h3>
              <p className="text-xs text-slate-600">
                Tap each habit as you hit it today ({completedCount} of{" "}
                {totalHabits} complete — {percent}%)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {nutrition.habits.map((habit) => {
            const isChecked = completedSet.has(habit.id);
            return (
              <button
                key={habit.id}
                type="button"
                aria-pressed={isChecked}
                onClick={() => onToggleHabit(habit.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                  isChecked
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                }`}
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
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-sm font-bold ${
                        isChecked
                          ? "text-emerald-950 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {habit.title}
                    </p>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
                      {habit.timing}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{habit.detail}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">
                    Why: {habit.whyItMatters}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section
          aria-labelledby="portion-guide-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h3
              id="portion-guide-heading"
              className="text-base font-bold text-slate-900"
            >
              Simple Hand-Portion Plate Guide (No Calorie Counting)
            </h3>
          </div>

          <div className="space-y-3">
            {nutrition.portionRule.map((rule) => (
              <div
                key={rule.macro}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    {rule.macro}
                  </span>
                  <span className="rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                    {rule.portion}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{rule.examples}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="meal-blueprint-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <h3
            id="meal-blueprint-heading"
            className="text-base font-bold text-slate-900 mb-4"
          >
            Sample School &amp; Practice Day Fuel Plan
          </h3>

          <div className="space-y-3">
            {nutrition.sampleMealPlan.map((item) => (
              <div
                key={item.slot}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  {item.slot}
                </p>
                <p className="mt-1 text-sm text-slate-800">{item.meal}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
