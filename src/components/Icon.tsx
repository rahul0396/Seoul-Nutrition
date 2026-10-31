import {
  Apple, BadgeCheck, BadgePlus, BatteryCharging, Bone, CandyOff, Droplets, Dumbbell, FileCheck2, FlaskConical, Gift,
  LayoutGrid, Leaf, Moon, Percent, Pill, Rocket, Scale, ScanSearch, Shield, ShieldCheck, ShoppingBag, Sparkles, Ticket,
  Trophy, Wheat, Zap, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Apple, BadgeCheck, BadgePlus, BatteryCharging, Bone, CandyOff, Droplets, Dumbbell, FileCheck2, FlaskConical, Gift,
  LayoutGrid, Leaf, Moon, Percent, Pill, Rocket, Scale, ScanSearch, Shield, ShieldCheck, ShoppingBag, Sparkles, Ticket,
  Trophy, Wheat, Zap,
};

export function Icon({ name, className = "size-6", strokeWidth = 1.75 }: { name: string; className?: string; strokeWidth?: number }) {
  const C = map[name] ?? Sparkles;
  return <C className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
