import texts from "./texts.json";

export const FIG_W = 440;
export const FIG_H = 770;

export type View = "front" | "back";
export type AreaId = keyof typeof texts.areas.labels;

const baseUrl = import.meta.env.BASE_URL;

export const FIG_SRC: Record<View, string> = {
  front: `${baseUrl}body-front.jpg`,
  back: `${baseUrl}body-back.jpg`,
};

type Poly = { id: AreaId; d: string };

export const POLY_FRONT: Poly[] = [
  { id: "headFront", d: "M213,19 204,22 193,31 187,46 186,58 188,76 196,98 245,98 252,79 254,67 253,46 247,31 241,25 228,19Z" },
  { id: "neckFront", d: "M196,98 197,116 195,122 193,125 179,133 262,133 248,125 244,119 245,98Z" },
  { id: "shoulderFrontRight", d: "M179,133 168,139 145,148 134,157 125,172 115,205 112,210 156,210 194,133Z" },
  { id: "shoulderFrontLeft", d: "M246,133 284,210 329,210 323,196 318,175 312,163 305,154 291,145 273,139 262,133Z" },
  { id: "chest", d: "M194,133 154,211 165,265 276,265 287,211 284,208 246,133Z" },
  { id: "abdomen", d: "M165,265 167,280 161,310 161,319 153,337 288,337 284,331 281,322 281,313 275,283 276,265Z" },
  { id: "groin", d: "M153,337 146,400 295,400 288,337Z" },
  { id: "upperArmFrontRight", d: "M112,210 92,252 80,268 71,286 65,305 103,305 107,300 123,266 139,242 148,224 152,210Z" },
  { id: "upperArmFrontLeft", d: "M289,210 292,222 303,244 320,270 337,305 376,305 370,286 361,268 349,252 340,234 335,220 329,210Z" },
  { id: "forearmFrontRight", d: "M65,305 43,363 31,389 31,395 27,409 30,429 34,429 37,427 38,421 43,417 41,407 53,405 56,401 56,389 62,377 62,363 64,359 77,339 103,305Z" },
  { id: "forearmFrontLeft", d: "M337,305 370,349 378,365 378,375 385,389 386,401 388,405 399,407 398,417 403,421 403,425 406,429 410,429 413,411 410,397 410,389 398,365 396,357 383,327 376,305Z" },
  { id: "thighFrontRight", d: "M146,400 143,421 143,463 147,493 147,515 194,515 198,484 210,442 214,421 215,403 217,400Z" },
  { id: "thighFrontLeft", d: "M223,400 225,403 225,412 231,445 241,478 246,515 294,515 293,502 298,454 298,427 295,400Z" },
  { id: "lowerLegFrontRight", d: "M147,515 144,545 135,581 135,608 141,665 141,683 135,716 117,743 119,749 128,752 155,752 166,749 166,734 164,731 163,722 164,674 168,650 181,608 183,596 183,554 193,524 194,515Z" },
  { id: "lowerLegFrontLeft", d: "M246,515 248,527 258,560 257,593 259,605 269,638 275,668 276,734 273,737 273,746 285,752 311,752 324,749 330,746 335,734 334,731 312,728 307,722 302,710 302,701 299,689 299,659 306,605 306,584 303,566 296,542 294,515Z" },
];

export const POLY_BACK: Poly[] = [
  { id: "headBack", d: "M213,19 198,25 192,31 187,40 185,49 185,64 187,79 193,98 244,98 250,82 253,67 252,43 250,37 244,28 235,22 227,19Z" },
  { id: "neckBack", d: "M193,98 196,107 196,116 194,122 187,128 177,133 264,133 249,125 244,119 244,98Z" },
  { id: "shoulderBackRight", d: "M246,133 284,210 330,210 327,205 316,169 308,157 298,148 264,133Z" },
  { id: "shoulderBackLeft", d: "M177,133 166,139 142,148 132,157 124,169 117,190 115,202 110,210 156,210 194,133Z" },
  { id: "upperBack", d: "M194,133 156,208 152,211 155,232 164,265 275,265 282,241 287,211 284,208 246,133Z" },
  { id: "waist", d: "M164,265 165,286 161,307 160,325 155,345 285,345 279,319 279,310 274,283 275,265Z" },
  { id: "hip", d: "M155,345 152,369 149,378 144,408 143,428 212,428 215,404 223,403 227,427 297,428 295,402 288,369 285,345Z" },
  { id: "upperArmBackRight", d: "M288,210 294,228 301,242 318,268 324,284 335,305 374,305 368,284 360,268 347,250 330,210Z" },
  { id: "upperArmBackLeft", d: "M110,210 93,250 81,266 69,290 65,305 103,305 109,296 126,260 137,244 145,228 150,210Z" },
  { id: "forearmBackRight", d: "M335,305 367,349 375,365 372,377 376,389 376,403 377,405 393,407 391,419 395,423 396,427 401,427 406,409 404,401 404,389 396,371 374,305Z" },
  { id: "forearmBackLeft", d: "M65,305 44,365 33,389 31,413 35,429 39,429 44,419 42,411 43,407 57,405 59,401 59,389 64,377 62,365 67,355 103,305Z" },
  { id: "thighBackRight", d: "M227,428 231,449 241,482 245,515 293,515 292,506 297,455 297,428Z" },
  { id: "thighBackLeft", d: "M143,428 143,464 147,500 147,515 194,515 198,485 209,446 212,428Z" },
  { id: "lowerLegBackRight", d: "M245,515 257,560 256,584 259,614 269,647 275,680 274,710 276,719 276,734 272,737 272,746 280,749 307,749 325,746 332,743 333,740 329,737 316,734 314,728 308,725 302,716 298,680 306,599 304,578 294,539 293,515Z" },
  { id: "lowerLegBackLeft", d: "M147,515 146,539 137,575 134,599 141,665 141,695 138,707 138,716 134,722 126,728 123,734 124,740 135,746 147,749 161,749 167,746 167,737 164,734 163,728 165,713 165,680 172,644 182,611 184,590 183,560 194,515Z" },
];

export const POLYS: Record<View, Poly[]> = { front: POLY_FRONT, back: POLY_BACK };

/** Front regions first, then back, in the order shown to the reader. */
export const AREA_ORDER: AreaId[] = [...POLY_FRONT, ...POLY_BACK].map((p) => p.id);

/** A wider tap target for the narrow neck, under the chin and over the shoulders. */
export const NECK_HIT = "M166,100 L274,100 L274,144 L166,144 Z";

export function neckArea(view: View): AreaId {
  return view === "front" ? "neckFront" : "neckBack";
}

export function areaLabel(id: AreaId): string {
  return texts.areas.labels[id];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Lists picked regions compactly. Front and back of one part become (앞·뒤), and both sides become 양쪽. */
export function formatAreas(list: AreaId[]): string {
  const { right, left, front, back, bothSides, faceJoiner, listJoiner } = texts.areas.format;
  const re = new RegExp(
    `^(${escapeRegExp(right)} |${escapeRegExp(left)} )?(.+?)(\\((${escapeRegExp(front)}|${escapeRegExp(back)})\\))?$`,
  );
  type Parsed = { side: string; part: string; faces: string[] };
  const bySidePart: Parsed[] = [];
  list.forEach((id: AreaId) => {
    const label = areaLabel(id);
    const m = re.exec(label);
    const side = m && m[1] ? m[1].trim() : "";
    const part = m ? m[2] : label;
    const face = m && m[4] ? m[4] : "";
    const hit = bySidePart.find((p: Parsed) => p.side === side && p.part === part);
    if (hit) {
      if (face && !hit.faces.includes(face)) hit.faces.push(face);
    } else {
      bySidePart.push({ side, part, faces: face ? [face] : [] });
    }
  });
  const groups: { sides: string[]; part: string; faceKey: string }[] = [];
  bySidePart.forEach((p: Parsed) => {
    const faceKey =
      p.faces.length === 2 ? `(${front}${faceJoiner}${back})` : p.faces.length === 1 ? `(${p.faces[0]})` : "";
    const hit = groups.find((g) => g.part === p.part && g.faceKey === faceKey && p.side !== "");
    if (hit && p.side && !hit.sides.includes(p.side)) hit.sides.push(p.side);
    else groups.push({ sides: p.side ? [p.side] : [], part: p.part, faceKey });
  });
  return groups
    .map((g) => {
      const sidePrefix = g.sides.length === 2 ? `${bothSides} ` : g.sides.length === 1 ? `${g.sides[0]} ` : "";
      return `${sidePrefix}${g.part}${g.faceKey}`;
    })
    .join(listJoiner);
}
