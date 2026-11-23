import { FIG_H, FIG_W, POLYS, type AreaId, type View } from "./areas";
import { texts } from "./texts";
import { BRAND } from "./theme";

const SUM_SCALE = 1.5;

export type SummaryRow = { label: string; value: string };
export type FigImages = { front: HTMLImageElement | null; back: HTMLImageElement | null };

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of Array.from(text)) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur.length > 0) {
      lines.push(cur);
      cur = ch === " " ? "" : ch;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Splits editor line breaks, then wraps each piece to the card width. Returns the next y. */
function drawBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const pieces = text.split(/<br\s*\/?>|\r?\n/);
  let cy = y;
  pieces.forEach((piece, index) => {
    const lines = piece ? wrapLines(ctx, piece, maxWidth) : [""];
    if (index > 0 && lines.length === 0) {
      cy += lineHeight;
      return;
    }
    lines.forEach((line) => {
      if (line) ctx.fillText(line, x, cy);
      cy += lineHeight;
    });
  });
  return cy;
}

function drawFigure(
  ctx: CanvasRenderingContext2D,
  view: View,
  selected: AreaId[],
  ox: number,
  oy: number,
  s: number,
  img: HTMLImageElement | null,
): void {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(s, s);
  ctx.lineJoin = "round";
  if (img) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, FIG_W, FIG_H);
  } else {
    ctx.fillStyle = "#d9dde3";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    POLYS[view].forEach((p) => {
      const path = new Path2D(p.d);
      ctx.fill(path);
      ctx.stroke(path);
    });
  }
  POLYS[view].forEach((p) => {
    if (!selected.includes(p.id)) return;
    const path = new Path2D(p.d);
    ctx.fillStyle = "rgba(30, 111, 255, 0.5)";
    ctx.fill(path);
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = 2;
    ctx.stroke(path);
  });
  ctx.restore();
}

export function renderSummaryPng(
  rows: SummaryRow[],
  areas: AreaId[],
  treatment: string[],
  dateText: string,
  font: string,
  imgs: FigImages,
  target?: HTMLCanvasElement | null,
): string {
  const W = 1080;
  const H = 1600;
  const canvas = target ?? document.createElement("canvas");
  canvas.width = W * SUM_SCALE;
  canvas.height = H * SUM_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-2d");
  ctx.setTransform(SUM_SCALE, 0, 0, SUM_SCALE, 0, 0);

  ctx.fillStyle = "#eef4ff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  roundRectPath(ctx, 40, 40, W - 80, H - 80, 40);
  ctx.fill();

  const L = 90;
  ctx.fillStyle = BRAND;
  ctx.font = `700 38px ${font}`;
  ctx.textAlign = "left";
  drawBlock(ctx, texts.brand.clinic, L, 130, W - 2 * L, 46);

  ctx.fillStyle = "#111827";
  ctx.font = `700 64px ${font}`;
  drawBlock(ctx, texts.card.title, L, 215, W - 2 * L, 76);

  ctx.fillStyle = "#6b7280";
  ctx.font = `500 34px ${font}`;
  ctx.textAlign = "right";
  drawBlock(ctx, dateText, W - L, 130, W - 2 * L, 42);
  ctx.textAlign = "left";

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(L, 255, W - 2 * L, 2);

  const s = 0.52;
  const figTop = 300;
  const figGap = 236;
  drawFigure(ctx, "front", areas, L - 6, figTop + 40, s, imgs.front);
  drawFigure(ctx, "back", areas, L - 6 + figGap, figTop + 40, s, imgs.back);
  ctx.fillStyle = "#374151";
  ctx.font = `600 30px ${font}`;
  ctx.textAlign = "center";
  drawBlock(ctx, texts.card.front, L - 6 + (FIG_W * s) / 2, figTop + 20, FIG_W * s, 36);
  drawBlock(ctx, texts.card.back, L - 6 + figGap + (FIG_W * s) / 2, figTop + 20, FIG_W * s, 36);
  ctx.textAlign = "left";

  const RX = 560;
  const RW = W - L - RX;
  let y = figTop + 20;
  rows.forEach((row) => {
    ctx.fillStyle = "#6b7280";
    ctx.font = `500 28px ${font}`;
    y = drawBlock(ctx, row.label, RX, y, RW, 44);
    ctx.fillStyle = "#111827";
    ctx.font = `700 36px ${font}`;
    y = drawBlock(ctx, row.value, RX, y, RW, 44);
    y += 18;
  });

  let ty = Math.max(y, figTop + 40 + FIG_H * s) + 30;
  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(L, ty, W - 2 * L, 2);
  ty += 70;
  ctx.fillStyle = "#6b7280";
  ctx.font = `500 30px ${font}`;
  ty = drawBlock(ctx, texts.card.recommendedHeading, L, ty, W - 2 * L, 40);
  ty += 26;
  ctx.fillStyle = BRAND;
  ctx.font = `700 50px ${font}`;
  ty = drawBlock(ctx, treatment[0] ?? "", L, ty, W - 2 * L, 62);
  ctx.fillStyle = "#111827";
  ctx.font = `600 38px ${font}`;
  treatment.slice(1).forEach((item) => {
    ty = drawBlock(ctx, `· ${item}`, L, ty, W - 2 * L, 54);
  });

  ctx.fillStyle = "#6b7280";
  ctx.font = `500 28px ${font}`;
  const footPieces = texts.card.footer.split(/<br\s*\/?>|\r?\n/);
  const footLines = footPieces.flatMap((piece) => (piece ? wrapLines(ctx, piece, W - 2 * L) : [""]));
  let fy = H - 80 - footLines.length * 40;
  footLines.forEach((line) => {
    if (line) ctx.fillText(line, L, fy);
    fy += 40;
  });

  if (target) return "drawn";
  return canvas.toDataURL("image/png");
}

export function dataUrlToBlob(url: string): Blob {
  const base64 = url.split(",")[1] ?? "";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "image/png" });
}

export function tryDownload(source: Blob | string, fileName: string): void {
  try {
    const blob = typeof source === "string" ? dataUrlToBlob(source) : source;
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout((): void => {
      URL.revokeObjectURL(href);
    }, 2000);
  } catch {
    /* The browser blocked the download. The on-screen image stays available. */
  }
}
