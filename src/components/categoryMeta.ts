import {
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { ScheduleCategoryId } from "../domain/types";

export interface CategoryPresentation {
  label: string;
  badgeText: string;
  badgeClass: string;
  accentBorderClass: string;
  iconBgClass: string;
  Icon: LucideIcon;
}

export const CATEGORY_META: Record<ScheduleCategoryId, CategoryPresentation> = {
  "upper-body": {
    label: "Upper Body",
    badgeText: "Upper Body",
    badgeClass: "bg-slate-100 text-slate-800 border border-slate-300",
    accentBorderClass: "border-t-4 border-t-slate-800",
    iconBgClass: "bg-slate-800 text-white",
    Icon: Shield,
  },
  "lower-body": {
    label: "Lower Body",
    badgeText: "Lower Body",
    badgeClass: "bg-amber-50 text-amber-900 border border-amber-300",
    accentBorderClass: "border-t-4 border-t-amber-600",
    iconBgClass: "bg-amber-600 text-white",
    Icon: Dumbbell,
  },
  explosive: {
    label: "Explosive Days",
    badgeText: "Explosive Power",
    badgeClass: "bg-orange-50 text-orange-900 border border-orange-300",
    accentBorderClass: "border-t-4 border-t-orange-600",
    iconBgClass: "bg-orange-600 text-white",
    Icon: Flame,
  },
  running: {
    label: "Running Days",
    badgeText: "Speed & Conditioning",
    badgeClass: "bg-emerald-50 text-emerald-900 border border-emerald-300",
    accentBorderClass: "border-t-4 border-t-emerald-600",
    iconBgClass: "bg-emerald-600 text-white",
    Icon: Footprints,
  },
  recovery: {
    label: "Recovery",
    badgeText: "Rest & Prep",
    badgeClass: "bg-sky-50 text-sky-900 border border-sky-300",
    accentBorderClass: "border-t-4 border-t-sky-600",
    iconBgClass: "bg-sky-600 text-white",
    Icon: HeartPulse,
  },
};
