import { useState, type FormEvent } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { groupDrillsByCategory } from "../domain/programSelectors";
import type { CustomDrill, DrillsBlueprint } from "../domain/types";

interface DrillsPanelProps {
  drills: DrillsBlueprint;
  customDrills: CustomDrill[];
  onAddDrill: (input: {
    name: string;
    categoryId: string;
    prescription: string;
    cue: string;
  }) => void;
  onRemoveDrill: (drillId: string) => void;
}

export function DrillsPanel({
  drills,
  customDrills,
  onAddDrill,
  onRemoveDrill,
}: DrillsPanelProps) {
  const defaultCategoryId = drills.categories[0]?.id ?? "";
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [prescription, setPrescription] = useState("");
  const [cue, setCue] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const groupedDrills = groupDrillsByCategory(drills.categories, customDrills);
  const canSubmit =
    name.trim().length > 0 &&
    categoryId.trim().length > 0 &&
    prescription.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    onAddDrill({
      name: name.trim(),
      categoryId,
      prescription: prescription.trim(),
      cue: cue.trim(),
    });
    setStatusMessage(`Added "${name.trim()}" to your drill list.`);
    setName("");
    setPrescription("");
    setCue("");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Defensive Line Drills
                </h2>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300">
                  Ready for Your Drills
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{drills.note}</p>
            </div>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="add-drill-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
      >
        <h3
          id="add-drill-heading"
          className="text-base font-bold text-slate-900"
        >
          Add a Drill (Optional Now or Later)
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          Add any position drill now, or review the 4 category buckets below and
          we can populate them together when we tweak.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="drill-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Drill Name *
            </label>
            <input
              id="drill-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Med Ball Punch & Rip Shed"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="drill-category"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Drill Category *
            </label>
            <select
              id="drill-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
            >
              {drills.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="drill-prescription"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Sets / Reps or Duration *
            </label>
            <input
              id="drill-prescription"
              type="text"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="e.g. 4 sets × 5 reps each side"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="drill-cue"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Coaching Cue (Optional)
            </label>
            <input
              id="drill-cue"
              type="text"
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              placeholder="e.g. Thumbs up, violent hip snap, keep pad level low"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              {canSubmit
                ? "Ready to save this drill to your local browser list."
                : "Enter a drill name and sets/reps to enable adding."}
            </p>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Drill
            </button>
          </div>
        </form>

        {statusMessage && (
          <p
            role="status"
            className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900"
          >
            {statusMessage}
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {drills.categories.map((category) => {
          const addedForCategory = groupedDrills.get(category.id) ?? [];

          return (
            <section
              key={category.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {category.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {addedForCategory.length} added
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Planned Slots (To Be Added)
                </p>
                <ul className="space-y-1.5">
                  {category.plannedSlots.map((slot) => (
                    <li
                      key={slot}
                      className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                    >
                      Slot: {slot}
                    </li>
                  ))}
                </ul>
              </div>

              {addedForCategory.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Your Added Drills
                  </p>
                  <ul className="space-y-2">
                    {addedForCategory.map((drill) => (
                      <li
                        key={drill.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {drill.name}
                          </p>
                          <p className="mt-0.5 font-mono text-xs font-semibold text-slate-700">
                            {drill.prescription}
                          </p>
                          {drill.cue && (
                            <p className="mt-1 text-xs text-slate-600">
                              Cue: {drill.cue}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveDrill(drill.id)}
                          aria-label={`Remove ${drill.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
