import type { Engine, Part } from "@/data/mockData";

type RiskDriver =
  | "Schedule risk"
  | "Progress risk"
  | "Logistics risk"
  | "Service risk"
  | "Low visibility";

export type EngineHealth = {
  score: number; // 0..100
  driver: RiskDriver;
  isAtRisk: boolean;
};

export type AttentionSeverity = "critical" | "warning" | "info";

export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  title: string;
  description: string;
  engineId?: string;
  engineLabel?: string;
  ctaLabel: string;
  ctaHref?: string;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const parseYmd = (ymd?: string) => {
  if (!ymd) return null;
  const d = new Date(ymd);
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysBetween = (a: Date, b: Date) => {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

export const formatDays = (days: number) => {
  const abs = Math.abs(days);
  return `${abs} day${abs === 1 ? "" : "s"}`;
};

export function getEngineHealth(engine: Engine): EngineHealth {
  // In mock/demo mode, "today" should feel consistent with the dataset.
  const now = parseYmd(engine.lastUpdated) ?? new Date();
  const induction = parseYmd(engine.inductionDate);
  const expected = parseYmd(engine.expectedCompletion);

  const penalties: Record<RiskDriver, number> = {
    "Schedule risk": 0,
    "Progress risk": 0,
    "Logistics risk": 0,
    "Service risk": 0,
    "Low visibility": 0,
  };

  // Schedule: overdue or approaching.
  if (expected) {
    const dueIn = daysBetween(now, expected); // negative means overdue
    if (dueIn < 0) penalties["Schedule risk"] += clamp(Math.abs(dueIn) * 2.2, 10, 45);
    else if (dueIn <= 14) penalties["Schedule risk"] += clamp((14 - dueIn) * 1.4, 6, 18);
  } else {
    penalties["Low visibility"] += 12;
  }

  // Progress: behind expected curve (very rough heuristic).
  if (induction && expected) {
    const total = Math.max(1, daysBetween(induction, expected));
    const elapsed = clamp(daysBetween(induction, now), 0, total + 120);
    const expectedProgress = clamp((elapsed / total) * 100, 0, 100);
    const delta = expectedProgress - engine.progress; // positive => behind
    if (delta > 0) penalties["Progress risk"] += clamp(delta * 0.6, 0, 30);
  } else if (engine.progress < 35) {
    penalties["Progress risk"] += 10;
  }

  // Status-based risk.
  if (engine.status === "In Transit") penalties["Logistics risk"] += 10;
  if (engine.status === "Inspection") penalties["Service risk"] += 8;
  if (engine.status === "Disassembly") penalties["Service risk"] += 6;
  if (engine.status === "In Repair") penalties["Service risk"] += 9;
  if (engine.status === "Completed" || engine.status === "Ready for Release") {
    penalties["Service risk"] = Math.max(0, penalties["Service risk"] - 8);
    penalties["Schedule risk"] = Math.max(0, penalties["Schedule risk"] - 10);
  }

  const totalPenalty = Object.values(penalties).reduce((s, v) => s + v, 0);
  const score = clamp(Math.round(100 - totalPenalty), 0, 100);

  const driver = (Object.entries(penalties).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Low visibility") as RiskDriver;

  return { score, driver, isAtRisk: score < 70 };
}

export function getEngineStory(engine: Engine) {
  const now = parseYmd(engine.lastUpdated) ?? new Date();
  const induction = parseYmd(engine.inductionDate);
  const expected = parseYmd(engine.expectedCompletion);

  const elapsedDays = induction ? Math.max(0, daysBetween(induction, now)) : null;
  const plannedDays = induction && expected ? Math.max(1, daysBetween(induction, expected)) : null;

  const dueInDays = expected ? daysBetween(now, expected) : null; // negative => overdue
  const isOverdue = typeof dueInDays === "number" ? dueInDays < 0 : false;

  const timelineProgress =
    typeof elapsedDays === "number" && typeof plannedDays === "number"
      ? clamp(Math.round((elapsedDays / plannedDays) * 100), 0, 150)
      : null;

  return { now, induction, expected, elapsedDays, plannedDays, dueInDays, isOverdue, timelineProgress };
}

export function buildAttentionItems(input: {
  engines: Engine[];
  parts?: Part[];
  limit?: number;
}): AttentionItem[] {
  const { engines, parts, limit = 6 } = input;

  const items: AttentionItem[] = [];

  const addEngineItem = (e: Engine, severity: AttentionSeverity, title: string, description: string) => {
    items.push({
      id: `engine-${e.id}-${title}`,
      severity,
      title,
      description,
      engineId: e.id,
      engineLabel: `${e.esn} · ${e.workOrder}`,
      ctaLabel: "Open engine",
      ctaHref: `/engine/${e.workOrder}-${e.esn}`,
    });
  };

  // Overdue / at-risk engines.
  for (const e of engines) {
    const story = getEngineStory(e);
    const health = getEngineHealth(e);
    if (story.isOverdue) {
      addEngineItem(
        e,
        "critical",
        "Overdue vs plan",
        `Past expected completion by ${formatDays(Math.abs(story.dueInDays ?? 0))}. Driver: ${health.driver}.`,
      );
      continue;
    }

    if (health.score < 65) {
      addEngineItem(e, "warning", "Health score dropping", `Health ${health.score}/100. Driver: ${health.driver}.`);
    } else if (typeof story.dueInDays === "number" && story.dueInDays <= 14) {
      addEngineItem(
        e,
        "info",
        "Due soon",
        `Expected completion in ${formatDays(story.dueInDays)}. Health ${health.score}/100.`,
      );
    }
  }

  // Parts signal (sale-ready).
  if (parts) {
    const saleReady = parts.filter((p) => p.category === "Sell" && p.saleStatus === "Available");
    const saleReadyValue = saleReady.reduce((s, p) => s + (p.price ?? 0), 0);
    if (saleReady.length > 0) {
      items.push({
        id: "parts-sale-ready",
        severity: saleReady.length >= 20 ? "warning" : "info",
        title: "Sale-ready parts available",
        description: `${saleReady.length} parts available (est. $${saleReadyValue.toLocaleString()}).`,
        ctaLabel: "Open catalog",
        ctaHref: "/catalog",
      });
    }
  }

  const severityRank: Record<AttentionSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return items
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, limit);
}

