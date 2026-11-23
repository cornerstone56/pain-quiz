import type { AreaId } from "./areas";
import { fill, texts, type DetailCopy } from "./texts";

export type DurationId = "under2w" | "2wTo1m" | "1to3m" | "over3m";
export type DailyId = "hard" | "ok";
export type TreatmentKey = "maesun" | "dochim" | "yakchim" | "chuna";

export type Answers = {
  areas?: AreaId[];
  duration?: DurationId;
  pain?: number;
  daily?: DailyId;
  tingling?: boolean;
  weakness?: boolean;
  wantFast?: boolean;
};

export type TreatmentDef = {
  id: string;
  name: string;
  explain: string;
  detail?: DetailCopy[];
};

export type CardVariant = "recommended" | "emphasized" | "outlined";

export type TreatmentCard = TreatmentDef & {
  variant: CardVariant;
  badge: string | null;
};

export type Evaluation = {
  main: TreatmentDef;
  cards: TreatmentCard[];
  caption: string | null;
};

export const QUESTION_KEYS = ["areas", "duration", "pain", "daily", "tingling", "weakness", "wantFast"] as const;
export const TOTAL = QUESTION_KEYS.length;

export const DURATION_ORDER: DurationId[] = ["under2w", "2wTo1m", "1to3m", "over3m"];

const TREATMENT_ORDER: TreatmentKey[] = ["yakchim", "chuna", "maesun", "dochim"];

function treatmentDef(key: TreatmentKey): TreatmentDef {
  const item = texts.treatments[key];
  return { id: key, name: item.name, explain: item.explain, detail: item.detail };
}

export function durationLabel(id: DurationId): string {
  return texts.questions.duration[id];
}

export function evaluate(answers: Answers): Evaluation {
  const pain = typeof answers.pain === "number" ? answers.pain : 0;
  const hasNerve = !!(answers.tingling || answers.weakness);
  const dailyHard = answers.daily === "hard";
  const wantQuick = !!answers.wantFast;
  const longDuration = answers.duration === "1to3m" || answers.duration === "over3m";
  const isIntensifying = pain >= 5 || hasNerve || dailyHard || longDuration;

  const highlighted: Record<TreatmentKey, boolean> = isIntensifying
    ? { maesun: true, dochim: hasNerve, yakchim: true, chuna: true }
    : { maesun: false, dochim: hasNerve, yakchim: wantQuick, chuna: false };

  const cards: TreatmentCard[] = TREATMENT_ORDER.map((key) => {
    const item = treatmentDef(key);
    if (highlighted[key]) {
      return { ...item, variant: "recommended", badge: texts.badges.recommended };
    }
    return {
      ...item,
      variant: "outlined",
      badge: isIntensifying ? null : texts.badges.consult,
    };
  });

  const mainKey = isIntensifying ? "intensifying" : "basic";
  const main = texts.main[mainKey];
  return {
    main: { id: mainKey, name: main.name, explain: main.explain },
    cards,
    caption: null,
  };
}

export function summaryTreatmentLines(ev: Evaluation): string[] {
  const recommended = ev.cards.filter((card) => card.variant === "recommended");
  if (recommended.length > 0) {
    return recommended.map((card) => fill(texts.card.recommendedItem, { name: card.name }));
  }
  return [texts.card.consultFallback];
}
