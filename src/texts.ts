import raw from "./texts.json";

export type DetailCopy = { title?: string; text: string };

export type Texts = {
  meta: { title: string };
  brand: { clinic: string };
  start: { title: string; description: string; button: string };
  nav: { back: string; next: string; restart: string; progress: string };
  questions: {
    areas: {
      text: string;
      front: string;
      back: string;
      hint: string;
      cancelHint: string;
      selected: string;
      frontImageAlt: string;
      backImageAlt: string;
      frontAria: string;
      backAria: string;
    };
    duration: {
      text: string;
      under2w: string;
      "2wTo1m": string;
      "1to3m": string;
      over3m: string;
    };
    pain: { text: string; aria: string; none: string; worst: string };
    daily: { text: string; hard: string; ok: string };
    tingling: { text: string; yes: string; no: string };
    weakness: { text: string; yes: string; no: string };
    wantFast: { text: string; yes: string; no: string };
  };
  areas: {
    labels: Record<
      | "headFront"
      | "neckFront"
      | "shoulderFrontRight"
      | "shoulderFrontLeft"
      | "chest"
      | "abdomen"
      | "groin"
      | "upperArmFrontRight"
      | "upperArmFrontLeft"
      | "forearmFrontRight"
      | "forearmFrontLeft"
      | "thighFrontRight"
      | "thighFrontLeft"
      | "lowerLegFrontRight"
      | "lowerLegFrontLeft"
      | "headBack"
      | "neckBack"
      | "shoulderBackRight"
      | "shoulderBackLeft"
      | "upperBack"
      | "waist"
      | "hip"
      | "upperArmBackRight"
      | "upperArmBackLeft"
      | "forearmBackRight"
      | "forearmBackLeft"
      | "thighBackRight"
      | "thighBackLeft"
      | "lowerLegBackRight"
      | "lowerLegBackLeft",
      string
    >;
    format: {
      right: string;
      left: string;
      front: string;
      back: string;
      bothSides: string;
      faceJoiner: string;
      listJoiner: string;
    };
  };
  main: {
    intensifying: { name: string; explain: string };
    basic: { name: string; explain: string };
  };
  treatments: {
    maesun: { name: string; explain: string; detail: DetailCopy[] };
    dochim: { name: string; explain: string; detail: DetailCopy[] };
    yakchim: { name: string; explain: string; detail: DetailCopy[] };
    chuna: { name: string; explain: string; detail: DetailCopy[] };
  };
  badges: { recommended: string; consult: string };
  treatmentUi: { detailTitle: string; expand: string; collapse: string };
  result: {
    basedOn: string;
    recommend: string;
    tapHint: string;
    imageHeading: string;
    drawFailed: string;
    makeFailed: string;
    making: string;
    tapCardToZoom: string;
    tapImageToZoom: string;
    saveShare: string;
    imageAlt: string;
    canvasAlt: string;
    zoomDialog: string;
    close: string;
    longPress: string;
    captureInstead: string;
    shareTitle: string;
  };
  card: {
    title: string;
    front: string;
    back: string;
    recommendedHeading: string;
    footer: string;
    fileName: string;
    date: string;
    painValue: string;
    recommendedItem: string;
    consultFallback: string;
    rows: {
      area: string;
      duration: string;
      pain: string;
      daily: string;
      tingling: string;
      weakness: string;
      present: string;
      absent: string;
    };
  };
};

export const texts: Texts = raw;

/** Replaces {name} placeholders. Unknown placeholders are left as written. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole,
  );
}
