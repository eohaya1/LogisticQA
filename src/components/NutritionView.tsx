import { CheckSquare, DollarSign, RotateCcw, ShoppingCart, Square, Utensils } from "lucide-react";
import { computeDailyMealPlanCost } from "../domain/calculations";
import { nutritionConfig } from "../data/programRepository";
import type { AthleteTrackerState, NutritionGoalId } from "../types/program";

interface NutritionViewProps {
  state: AthleteTrackerState;
  onSelectNutritionGoal: (goalId: NutritionGoalId) => void;
  onToggleHabit: (habitId: string) => void;
  onResetHabits: () => void;
  onToggleGroceryItem: (itemKey: string) => void;
}

export function NutritionView({
  state,
  onSelectNutritionGoal,
  onToggleHabit,
  onResetHabits,
  onToggleGroceryItem,
}: NutritionViewProps) {
  const activeGoalMode =
    nutritionConfig.goalModes.find((g) => g.id === state.selectedNutritionGoal) ??
    nutritionConfig.goalModes[0]!;

  const dailyCost = computeDailyMealPlanCost(nutritionConfig.mealSlots);
  const weeklyEstimatedCost = (dailyCost * 7).toFixed(2);
  const checkedSet = new Set(state.dailyHabitsCheckedIds);
  const grocerySet = new Set(state.checkedGroceryItems);

  return (
    <div className="space-y-8">
      {/* Goal Selector + Budget Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              <DollarSign className="h-3.5 w-3.5" aria-hidden />
              Affordable High School Fuel (~${dailyCost.toFixed(2)}/day • ~$
              {weeklyEstimatedCost}/week est.)
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              High School D-Line Meal Plan & Healthy Habits
            </h2>
            <p className="max-w-2xl text-sm text-slate-600">
              {nutritionConfig.budgetSummaryNote}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Choose Your Offseason Body-Comp Goal (Adjusts Meal Portions)
          </div>
          <div
            role="radiogroup"
            aria-label="Nutrition goal mode"
            className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3"
          >
            {nutritionConfig.goalModes.map((mode) => {
              const selected = mode.id === activeGoalMode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onSelectNutritionGoal(mode.id)}
                  className={`min-h-[44px] rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900">
                    {mode.label}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{mode.summary}</p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 rounded-lg bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700">
            Macro Focus ({activeGoalMode.label}): {activeGoalMode.macroFocus}
          </p>
        </div>
      </section>

      {/* Specific Daily Meal Plan */}
      <section aria-labelledby="meal-plan-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="meal-plan-heading"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <Utensils className="h-5 w-5 text-amber-600" aria-hidden />
              Specific Daily Meal Plan (School-Day Schedule)
            </h2>
            <p className="text-sm text-slate-600">
              Concrete, kid-friendly foods you can pack in a backpack or cook in
              under 15 minutes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {nutritionConfig.mealSlots.map((slot) => (
            <article
              key={slot.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
                      {slot.timing}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {slot.name}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-emerald-900">
                    ~${slot.estimatedCostPerServingUsd.toFixed(2)}/meal
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{slot.purpose}</p>

                <ul className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
                  {slot.foods.map((foodItem) => (
                    <li
                      key={foodItem.food}
                      className="rounded-xl bg-slate-50 p-3"
                    >
                      <div className="text-sm font-bold text-slate-900">
                        {foodItem.food}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold text-emerald-800">
                        Portion: {foodItem.portionByGoal[activeGoalMode.id]}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Budget note: {foodItem.budgetSwap}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Prep tip:</span>{" "}
                {slot.prepTip}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Healthy Eating Habits Daily Checklist */}
      <section
        aria-labelledby="habits-heading"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="habits-heading"
              className="text-lg font-bold text-slate-900"
            >
              8 Non-Negotiable Healthy Eating & Recovery Habits
            </h2>
            <p className="text-sm text-slate-600">
              Check off what you nailed today ({state.dailyHabitsCheckedIds.length}
              /{nutritionConfig.habits.length} completed).
            </p>
          </div>
          <button
            type="button"
            onClick={onResetHabits}
            disabled={state.dailyHabitsCheckedIds.length === 0}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Start Fresh Day
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {nutritionConfig.habits.map((habit) => {
            const isChecked = checkedSet.has(habit.id);
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => onToggleHabit(habit.id)}
                className={`flex min-h-[44px] items-start gap-3 rounded-xl border p-4 text-left transition ${
                  isChecked
                    ? "border-emerald-500 bg-emerald-50/70"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {isChecked ? (
                  <CheckSquare
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                ) : (
                  <Square
                    className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
                    aria-hidden
                  />
                )}
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900">
                    {habit.title}
                  </div>
                  <div className="text-xs font-semibold text-amber-800">
                    Target: {habit.target}
                  </div>
                  <p className="text-xs text-slate-600">{habit.whyItMatters}</p>
                  <p className="text-xs font-medium text-slate-700">
                    HS Hack: {habit.highSchoolTip}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Affordable Weekly Grocery List */}
      <section
        aria-labelledby="grocery-heading"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-slate-800" aria-hidden />
          <h2 id="grocery-heading" className="text-lg font-bold text-slate-900">
            Weekly Affordable Grocery List
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Tap items as you shop with your family or on your own weekly grocery
          run.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {nutritionConfig.groceryList.map((group) => (
            <div
              key={group.category}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {group.category}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => {
                  const key = `${group.category}:${item.name}`;
                  const checked = grocerySet.has(key);
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => onToggleGroceryItem(key)}
                        className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition ${
                          checked
                            ? "border-emerald-400 bg-emerald-50 text-slate-500 line-through"
                            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        {checked ? (
                          <CheckSquare
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                            aria-hidden
                          />
                        ) : (
                          <Square
                            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                            aria-hidden
                          />
                        )}
                        <div>
                          <div className="text-xs font-bold">{item.name}</div>
                          <div className="text-[11px] font-medium text-amber-800">
                            {item.weeklyQuantity}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.budgetNote}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
