import { useState, type FormEvent } from "react";
import { Download, RotateCcw, Upload, X } from "lucide-react";
import type { AthleteTrackerState } from "../types/program";

interface SettingsModalProps {
  isOpen: boolean;
  state: AthleteTrackerState;
  onClose: () => void;
  onUpdateProfile: (
    name: string,
    position: AthleteTrackerState["positionGroup"]
  ) => void;
  onExportJson: () => string;
  onImportJson: (raw: string) => boolean;
  onResetAll: () => void;
}

export function SettingsModal({
  isOpen,
  state,
  onClose,
  onUpdateProfile,
  onExportJson,
  onImportJson,
  onResetAll,
}: SettingsModalProps) {
  const [nameInput, setNameInput] = useState(state.athleteName);
  const [positionInput, setPositionInput] = useState(state.positionGroup);
  const [importText, setImportText] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    onUpdateProfile(nameInput, positionInput);
    setFeedback("Athlete profile saved.");
  }

  function handleDownloadBackup() {
    const json = onExportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hs-dl-offseason-log.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback("Downloaded JSON backup file.");
  }

  function handleImportSubmit(event: FormEvent) {
    event.preventDefault();
    if (importText.trim() === "") {
      setFeedback("Paste your exported JSON backup before importing.");
      return;
    }
    const ok = onImportJson(importText);
    if (ok) {
      setImportText("");
      setFeedback("Training log imported successfully.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2
            id="settings-modal-title"
            className="text-lg font-bold text-slate-900"
          >
            Athlete Profile & Data Backup
          </h2>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Athlete Name (Optional)
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g., Marcus #94"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Position Group
            <select
              value={positionInput}
              onChange={(e) =>
                setPositionInput(
                  e.target.value as AthleteTrackerState["positionGroup"]
                )
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="DL (General)">DL (General)</option>
              <option value="DE">Defensive End (DE)</option>
              <option value="DT">Defensive Tackle (DT)</option>
              <option value="NT">Nose Tackle (NT)</option>
            </select>
          </label>
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Save Profile
          </button>
        </form>

        <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-bold text-slate-900">
            Backup & Restore (Saved Locally on This Device)
          </h3>
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export Training Log JSON
          </button>

          <form onSubmit={handleImportSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Restore from Exported JSON
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste exported JSON here..."
                className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" aria-hidden />
              Import JSON Backup
            </button>
          </form>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset All Logs & Goals
            </button>
          ) : (
            <div className="space-y-2 rounded-xl border border-red-300 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-900">
                This clears all logged lifts, speed times, custom drills, and
                goals on this device. Confirm reset?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetAll();
                    setConfirmReset(false);
                    setFeedback("All personal data cleared.");
                  }}
                  className="min-h-[40px] flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {feedback && (
          <p className="mt-3 text-center text-xs font-semibold text-emerald-700">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
