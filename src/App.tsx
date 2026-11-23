import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { AREA_ORDER, formatAreas, type AreaId, type View } from "./areas";
import { BodyFigure } from "./components/BodyFigure";
import { PainRuler } from "./components/PainRuler";
import { TreatmentCardView } from "./components/TreatmentCard";
import {
  DURATION_ORDER,
  TOTAL,
  durationLabel,
  evaluate,
  summaryTreatmentLines,
  type Answers,
  type DailyId,
  type DurationId,
  type Evaluation,
} from "./evaluate";
import { dataUrlToBlob, renderSummaryPng, tryDownload, type SummaryRow } from "./summaryCanvas";
import { RichText } from "./RichText";
import { fill, texts } from "./texts";
import { BRAND, BRAND_DARK, CHOICE_BORDER, DISABLED_BG, SOFT_BLUE, canvasFont, theme } from "./theme";

type ChoiceKey = "duration" | "daily" | "tingling" | "weakness" | "wantFast";
type ChoiceValue = DurationId | DailyId | boolean;

type StepQuestion =
  | { key: "areas"; layout: "areas" }
  | { key: "duration"; layout: "durations" }
  | { key: "pain"; layout: "pain" }
  | { key: "daily"; layout: "daily" }
  | { key: "tingling" | "weakness" | "wantFast"; layout: "yesno" };

const QUESTIONS: StepQuestion[] = [
  { key: "areas", layout: "areas" },
  { key: "duration", layout: "durations" },
  { key: "pain", layout: "pain" },
  { key: "daily", layout: "daily" },
  { key: "tingling", layout: "yesno" },
  { key: "weakness", layout: "yesno" },
  { key: "wantFast", layout: "yesno" },
];

type ShareNav = {
  share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  canShare?: (data: { files?: File[] }) => boolean;
};

function questionText(question: StepQuestion): string {
  return texts.questions[question.key].text;
}

export default function App(): ReactNode {
  const [step, setStep] = useState<number>(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [locked, setLocked] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState<boolean>(false);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const advanceTimer = useRef<number | null>(null);
  const summaryFigRef = useRef<HTMLDivElement | null>(null);
  const sumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<{ top: number; w: number } | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [zoomMode, setZoomMode] = useState<"blob" | "data" | "canvas">("canvas");
  const [zoomLoaded, setZoomLoaded] = useState<boolean>(false);
  // Inside a frame, downloads and the share sheet are unavailable, so the summary is painted
  // on a visible canvas. Opened as its own website, it becomes a real image file.
  const framed = useMemo((): boolean => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  const clearAdvanceTimer = useCallback((): void => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const inQuestion = step >= 0 && step < TOTAL;
  const question = inQuestion ? QUESTIONS[step] : null;
  const result = useMemo((): Evaluation | null => {
    if (step < TOTAL) return null;
    return evaluate(answers);
  }, [step, answers]);

  const today = useMemo((): { text: string; ymd: string } => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return {
      text: fill(texts.card.date, { year, month, day }),
      ymd: `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`,
    };
  }, []);

  const goTo = useCallback(
    (next: number): void => {
      clearAdvanceTimer();
      setLocked(false);
      setImgUrl(null);
      setSaveFailed(false);
      setShareHint(null);
      setStep(next);
    },
    [clearAdvanceTimer],
  );

  const onStart = useCallback((): void => goTo(0), [goTo]);
  const onBack = useCallback((): void => {
    if (step <= 0) goTo(-1);
    else goTo(step - 1);
  }, [goTo, step]);
  const onResultBack = useCallback((): void => goTo(TOTAL - 1), [goTo]);
  const onRestart = useCallback((): void => {
    setAnswers({});
    goTo(-1);
  }, [goTo]);

  const onPainChange = useCallback((n: number): void => {
    setAnswers((prev) => ({ ...prev, pain: n }));
  }, []);

  const onPainNext = useCallback((): void => {
    if (typeof answers.pain === "number") goTo(step + 1);
  }, [answers.pain, goTo, step]);

  const toggleArea = useCallback((area: AreaId): void => {
    setAnswers((prev) => {
      const cur = prev.areas ?? [];
      const next = cur.includes(area) ? cur.filter((item) => item !== area) : [...cur, area];
      next.sort((a, b) => AREA_ORDER.indexOf(a) - AREA_ORDER.indexOf(b));
      return { ...prev, areas: next };
    });
  }, []);

  const onChoose = useCallback(
    (key: ChoiceKey, value: ChoiceValue): void => {
      if (locked) return;
      setLocked(true);
      setAnswers((prev) => {
        if (key === "duration") return { ...prev, duration: value as DurationId };
        if (key === "daily") return { ...prev, daily: value as DailyId };
        return { ...prev, [key]: value as boolean };
      });
      clearAdvanceTimer();
      advanceTimer.current = window.setTimeout((): void => {
        setLocked(false);
        setStep((current) => current + 1);
        advanceTimer.current = null;
      }, 160);
    },
    [clearAdvanceTimer, locked],
  );

  const appStyle: CSSProperties = {
    width: "100%",
    maxWidth: 680,
    margin: "0 auto",
    minHeight: "100%",
    padding: "16px 20px 24px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    fontFamily: theme.font.family,
    color: theme.text.primary,
    background: theme.bg.base,
    wordBreak: "keep-all",
  };

  const primaryStyle: CSSProperties = {
    width: "100%",
    maxWidth: 360,
    minHeight: 64,
    border: 0,
    borderRadius: 20,
    background: BRAND,
    color: theme.text.onColor,
    fontFamily: theme.font.family,
    fontSize: 22,
    fontWeight: theme.weight.semibold,
    cursor: "pointer",
    boxShadow: "0 8px 28px rgba(30, 111, 255, 0.12)",
  };

  const secondaryStyle: CSSProperties = {
    minHeight: 64,
    minWidth: 96,
    padding: "0 18px",
    borderRadius: 20,
    border: `2px solid ${BRAND}`,
    background: theme.bg.elevated,
    color: BRAND,
    fontFamily: theme.font.family,
    fontSize: 22,
    fontWeight: theme.weight.semibold,
    cursor: "pointer",
    flex: "0 1 auto",
  };

  const backStyle: CSSProperties = {
    minHeight: 48,
    minWidth: 72,
    padding: "0 16px",
    fontSize: 18,
    fontWeight: theme.weight.semibold,
    color: theme.text.secondary,
    border: 0,
    borderRadius: 14,
    background: "transparent",
    fontFamily: theme.font.family,
    cursor: "pointer",
  };

  const selectedAreas = answers.areas ?? [];

  const summaryRows: SummaryRow[] = [
    { label: texts.card.rows.area, value: formatAreas(selectedAreas) },
    { label: texts.card.rows.duration, value: answers.duration ? durationLabel(answers.duration) : "" },
    {
      label: texts.card.rows.pain,
      value: typeof answers.pain === "number" ? fill(texts.card.painValue, { score: answers.pain }) : "",
    },
    {
      label: texts.card.rows.daily,
      value: answers.daily === "hard" ? texts.questions.daily.hard : texts.questions.daily.ok,
    },
    { label: texts.card.rows.tingling, value: answers.tingling ? texts.card.rows.present : texts.card.rows.absent },
    { label: texts.card.rows.weakness, value: answers.weakness ? texts.card.rows.present : texts.card.rows.absent },
  ];

  const findFigImage = (view: View): HTMLImageElement | null => {
    const root = summaryFigRef.current;
    if (!root) return null;
    const el = root.querySelector(`[data-view="${view}"] img`);
    if (el && el instanceof HTMLImageElement && el.complete && el.naturalWidth >= 200) return el;
    return null;
  };

  const genKey = result ? JSON.stringify([answers, today.text]) : "";
  useEffect(() => {
    if (!result) return;
    const lines = [result.main.name, ...summaryTreatmentLines(result)];
    const rows = summaryRows;
    const sel = selectedAreas;
    let cancelled = false;
    let tries = 0;
    let timer: number | null = null;
    const make = (usePhoto: boolean): string | null => {
      if (framed && !sumCanvasRef.current) return null;
      try {
        return renderSummaryPng(
          rows,
          sel,
          lines,
          today.text,
          canvasFont,
          usePhoto ? { front: findFigImage("front"), back: findFigImage("back") } : { front: null, back: null },
          framed ? sumCanvasRef.current : null,
        );
      } catch {
        return null;
      }
    };
    const show = (url: string | null): void => {
      if (!url) setSaveFailed(true);
      else if (!framed) setImgUrl(url);
    };
    const attempt = (): void => {
      if (cancelled) return;
      if (findFigImage("front") && findFigImage("back")) {
        show(make(true) ?? make(false));
        return;
      }
      tries += 1;
      if (tries === 1) show(make(false));
      if (tries < 30) timer = window.setTimeout(attempt, 300);
    };
    attempt();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
    // The summary is rebuilt only when the answers or the date change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genKey]);

  const fileName = fill(texts.card.fileName, { date: today.ymd });

  const onSave = (): void => {
    if (!imgUrl) return;
    try {
      const file = new File([dataUrlToBlob(imgUrl)], fileName, { type: "image/png" });
      const nav = navigator as unknown as ShareNav;
      if (typeof nav.canShare === "function" && nav.canShare({ files: [file] }) && typeof nav.share === "function") {
        nav.share({ files: [file], title: texts.result.shareTitle }).catch((err: unknown): void => {
          const name = err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "";
          if (name !== "AbortError") setShareHint(texts.result.longPress);
        });
        return;
      }
      tryDownload(file, fileName);
    } catch {
      setShareHint(texts.result.longPress);
    }
  };

  const closeZoom = (): void => {
    if (zoomSrc && zoomSrc.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(zoomSrc);
      } catch {
        /* ignore */
      }
    }
    setZoom(null);
    setZoomSrc(null);
    setZoomLoaded(false);
  };

  const openZoom = (event: MouseEvent<HTMLElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    const screenHeight = window.screen && window.screen.height ? window.screen.height : window.innerHeight;
    const vh = Math.min(window.innerHeight, screenHeight);
    const w = Math.max(200, Math.min(vw - 24, 560, ((vh - 110) * 1080) / 1600));
    const h = (w * 1600) / 1080 + 70;
    const centerY = framed ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const top = Math.max(8, Math.min(centerY - h / 2, window.innerHeight - h - 8));
    setZoom({ top, w });
    setZoomLoaded(false);
    if (!framed) {
      setZoomSrc(imgUrl);
      setZoomMode("data");
      return;
    }
    setZoomSrc(null);
    setZoomMode("canvas");
    const canvas = sumCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        setZoomSrc(URL.createObjectURL(blob));
        setZoomMode("blob");
      }, "image/png");
    } catch {
      setZoomMode("canvas");
    }
  };

  const onZoomImgError = (): void => {
    const canvas = sumCanvasRef.current;
    if (zoomMode === "blob" && canvas) {
      try {
        setZoomSrc(canvas.toDataURL("image/jpeg", 0.9));
        setZoomMode("data");
        return;
      } catch {
        /* fall through */
      }
    }
    setZoomSrc(null);
    setZoomMode("canvas");
  };

  const copyToZoomCanvas = (el: HTMLCanvasElement | null): void => {
    const src = sumCanvasRef.current;
    if (!el || !src) return;
    el.width = src.width;
    el.height = src.height;
    const ctx = el.getContext("2d");
    if (ctx) ctx.drawImage(src, 0, 0);
  };

  let body: ReactNode = null;

  if (step < 0) {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
          padding: "8px 0 12px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(30px, 7.2vw, 38px)",
            lineHeight: 1.35,
            fontWeight: theme.weight.semibold,
            letterSpacing: "-0.03em",
            wordBreak: "keep-all",
            color: theme.text.primary,
          }}
        >
          <RichText text={texts.start.title} />
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.65,
            color: theme.text.secondary,
            wordBreak: "keep-all",
            maxWidth: "22em",
          }}
        >
          <RichText text={texts.start.description} />
        </p>
        <button type="button" style={primaryStyle} onClick={onStart}>
          {texts.start.button}
        </button>
      </div>
    );
  } else if (question) {
    let choices: ReactNode = null;
    if (question.layout === "pain") {
      choices = <PainRuler value={answers.pain} onChange={onPainChange} onNext={onPainNext} />;
    } else if (question.layout === "areas") {
      const none = selectedAreas.length === 0;
      const areaCopy = texts.questions.areas;
      choices = (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "nowrap", justifyContent: "center", gap: 6, margin: "0 -14px" }}>
            {(["front", "back"] as View[]).map((view) => (
              <div
                key={view}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: 330,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: theme.weight.semibold,
                    color: theme.text.primary,
                    padding: "4px 14px",
                    borderRadius: 9999,
                    background: SOFT_BLUE,
                  }}
                >
                  {view === "front" ? areaCopy.front : areaCopy.back}
                </span>
                <BodyFigure view={view} selected={selectedAreas} onToggle={toggleArea} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: 18,
                fontWeight: theme.weight.semibold,
                color: theme.text.tertiary,
                wordBreak: "keep-all",
              }}
            >
              <RichText text={areaCopy.hint} />
            </p>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: 14,
                fontWeight: theme.weight.medium,
                color: theme.text.secondary,
                wordBreak: "keep-all",
              }}
            >
              <RichText text={areaCopy.cancelHint} />
            </p>
            {none ? null : (
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: theme.weight.semibold,
                  color: BRAND_DARK,
                  wordBreak: "keep-all",
                }}
              >
                <RichText text={fill(areaCopy.selected, { areas: formatAreas(selectedAreas) })} />
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={none}
            onClick={(): void => goTo(step + 1)}
            style={{
              ...primaryStyle,
              margin: "0 auto",
              display: "block",
              background: none ? DISABLED_BG : BRAND,
              cursor: none ? "default" : "pointer",
              boxShadow: none ? "none" : primaryStyle.boxShadow,
            }}
          >
            {texts.nav.next}
          </button>
        </div>
      );
    } else {
      let options: { label: string; value: ChoiceValue }[] = [];
      if (question.layout === "durations") {
        options = DURATION_ORDER.map((id) => ({ label: durationLabel(id), value: id }));
      } else if (question.layout === "daily") {
        options = [
          { label: texts.questions.daily.hard, value: "hard" },
          { label: texts.questions.daily.ok, value: "ok" },
        ];
      } else {
        const yesNo = texts.questions[question.key];
        options = [
          { label: yesNo.yes, value: true },
          { label: yesNo.no, value: false },
        ];
      }
      const single = question.layout === "daily";
      const currentValue: ChoiceValue | undefined =
        question.layout === "durations"
          ? answers.duration
          : question.layout === "daily"
            ? answers.daily
            : answers[question.key];
      choices = (
        <div style={{ display: "grid", gridTemplateColumns: single ? "1fr" : "1fr 1fr", gap: 12, width: "100%" }}>
          {options.map((opt) => {
            const selected = currentValue === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={(): void => onChoose(question.key as ChoiceKey, opt.value)}
                style={{
                  minHeight: single ? 72 : 64,
                  padding: "14px 16px",
                  borderRadius: 18,
                  border: `2px solid ${selected ? BRAND : CHOICE_BORDER}`,
                  background: selected ? BRAND : theme.bg.elevated,
                  color: selected ? theme.text.onColor : theme.text.primary,
                  fontFamily: theme.font.family,
                  fontSize: 22,
                  lineHeight: 1.4,
                  fontWeight: theme.weight.semibold,
                  cursor: "pointer",
                  boxShadow: selected ? "0 8px 28px rgba(30, 111, 255, 0.12)" : "none",
                  userSelect: "none",
                  wordBreak: "keep-all",
                }}
              >
                <RichText text={opt.label} />
              </button>
            );
          })}
        </div>
      );
    }
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 22,
          padding: "8px 0 12px",
          minHeight: 0,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(26px, 6.4vw, 34px)",
            lineHeight: 1.4,
            fontWeight: theme.weight.semibold,
            letterSpacing: "-0.03em",
            wordBreak: "keep-all",
            textAlign: "center",
            color: theme.text.primary,
          }}
        >
          <RichText text={questionText(question)} />
        </h2>
        {choices}
      </div>
    );
  } else if (result) {
    body = (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 14,
          padding: "8px 0 12px",
          minHeight: 0,
        }}
      >
        <p style={{ margin: 0, fontSize: 20, fontWeight: theme.weight.semibold, color: theme.text.secondary }}>
          <RichText text={texts.result.basedOn} />
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(26px, 6.6vw, 34px)",
            lineHeight: 1.4,
            fontWeight: theme.weight.semibold,
            color: BRAND,
            wordBreak: "keep-all",
            letterSpacing: "-0.03em",
          }}
        >
          <RichText text={fill(texts.result.recommend, { name: result.main.name })} />
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.7,
            color: theme.text.primary,
            wordBreak: "keep-all",
            maxWidth: "24em",
          }}
        >
          <RichText text={result.main.explain} />
        </p>
        {result.caption ? (
          <p
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: theme.weight.semibold,
              color: BRAND_DARK,
              wordBreak: "keep-all",
            }}
          >
            {result.caption}
          </p>
        ) : null}
        {result.cards.length > 0 ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontSize: 15, color: theme.text.secondary }}>
              <RichText text={texts.result.tapHint} />
            </p>
            {result.cards.map((card) => (
              <TreatmentCardView key={card.id} card={card} />
            ))}
          </div>
        ) : null}

        <div
          ref={summaryFigRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 440,
            display: "flex",
            gap: 4,
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          {(["front", "back"] as View[]).map((view) => (
            <div key={view} style={{ flex: 1 }}>
              <BodyFigure view={view} selected={selectedAreas} />
            </div>
          ))}
        </div>

        <div style={{ width: "100%", marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: theme.weight.semibold, color: theme.text.primary }}>
            <RichText text={texts.result.imageHeading} />
          </p>
          {framed ? (
            saveFailed ? (
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: theme.text.primary }}>
                <RichText text={texts.result.drawFailed} />
              </p>
            ) : (
              <>
                <canvas
                  ref={sumCanvasRef}
                  width={1620}
                  height={2400}
                  role="img"
                  aria-label={texts.result.canvasAlt}
                  onClick={openZoom}
                  style={{
                    display: "block",
                    width: "min(100%, 380px)",
                    height: "auto",
                    aspectRatio: "1080 / 1600",
                    borderRadius: 16,
                    border: `1px solid ${theme.border.default}`,
                    cursor: "zoom-in",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: 1.5,
                    fontWeight: theme.weight.semibold,
                    color: theme.text.primary,
                    wordBreak: "keep-all",
                  }}
                >
                  <RichText text={texts.result.tapCardToZoom} />
                </p>
              </>
            )
          ) : imgUrl ? (
            <img
              src={imgUrl}
              alt={texts.result.imageAlt}
              onClick={openZoom}
              style={
                {
                  width: "100%",
                  maxWidth: 520,
                  height: "auto",
                  borderRadius: 16,
                  border: `1px solid ${theme.border.default}`,
                  WebkitTouchCallout: "default",
                  cursor: "zoom-in",
                } as CSSProperties
              }
            />
          ) : saveFailed ? (
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: theme.text.primary }}>
              <RichText text={texts.result.makeFailed} />
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 16, color: theme.text.secondary }}>
              <RichText text={texts.result.making} />
            </p>
          )}
          {!framed && imgUrl ? (
            <button type="button" style={{ ...primaryStyle, width: "100%", maxWidth: 520, fontSize: 20 }} onClick={onSave}>
              {texts.result.saveShare}
            </button>
          ) : null}
          {!framed && imgUrl ? (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: theme.text.secondary, wordBreak: "keep-all" }}>
              <RichText text={texts.result.tapImageToZoom} />
            </p>
          ) : null}
          {shareHint ? (
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: theme.text.secondary, wordBreak: "keep-all" }}>
              <RichText text={shareHint} />
            </p>
          ) : null}
        </div>

        {zoom ? (
          <div
            role="dialog"
            aria-label={texts.result.zoomDialog}
            onClick={closeZoom}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(10, 16, 28, 0.82)" }}
          >
            <div
              onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
              style={{
                position: "absolute",
                left: "50%",
                top: zoom.top,
                width: zoom.w,
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  aria-label={texts.result.close}
                  onClick={closeZoom}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    border: 0,
                    background: "rgba(255,255,255,0.18)",
                    color: "#ffffff",
                    fontSize: 26,
                    lineHeight: "44px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
              {zoomSrc && zoomMode !== "canvas" ? (
                <img
                  src={zoomSrc}
                  alt={texts.result.imageAlt}
                  onLoad={() => setZoomLoaded(true)}
                  onError={onZoomImgError}
                  style={
                    {
                      display: "block",
                      width: "100%",
                      height: "auto",
                      borderRadius: 16,
                      WebkitTouchCallout: "default",
                      userSelect: "auto",
                    } as CSSProperties
                  }
                />
              ) : (
                <canvas
                  ref={copyToZoomCanvas}
                  role="img"
                  aria-label={texts.result.canvasAlt}
                  style={{ display: "block", width: "100%", height: "auto", aspectRatio: "1080 / 1600", borderRadius: 16 }}
                />
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.5,
                  fontWeight: 600,
                  color: "#ffffff",
                  textAlign: "center",
                  wordBreak: "keep-all",
                }}
              >
                <RichText
                  text={
                    zoomSrc && zoomMode !== "canvas" && zoomLoaded ? texts.result.longPress : texts.result.captureInstead
                  }
                />
              </p>
            </div>
          </div>
        ) : null}

        <div
          style={{
            width: "100%",
            maxWidth: 360,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            gap: 10,
            marginTop: 6,
          }}
        >
          <button type="button" style={secondaryStyle} onClick={onResultBack}>
            {texts.nav.back}
          </button>
          <button
            type="button"
            style={{ ...primaryStyle, flex: "1 1 160px", width: "auto", maxWidth: "none", fontSize: 20 }}
            onClick={onRestart}
          >
            {texts.nav.restart}
          </button>
        </div>
      </div>
    );
  }

  const progressPct = inQuestion ? ((step + 1) / TOTAL) * 100 : 0;

  return (
    <div lang="ko" style={appStyle}>
      <header style={{ flex: "0 0 auto", minHeight: 52, display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            fontWeight: theme.weight.semibold,
            letterSpacing: "0.04em",
            color: BRAND,
          }}
        >
          {texts.brand.clinic}
        </div>
        <div
          aria-hidden={inQuestion ? "false" : "true"}
          style={{
            height: inQuestion ? 8 : 0,
            background: SOFT_BLUE,
            borderRadius: 9999,
            overflow: "hidden",
            opacity: inQuestion ? 1 : 0,
            visibility: inQuestion ? "visible" : "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, #5b9bff, ${BRAND})`,
              borderRadius: 9999,
            }}
          />
        </div>
      </header>
      <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{body}</main>
      {inQuestion ? (
        <footer
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 56,
            paddingTop: 8,
            gap: 8,
          }}
        >
          <button type="button" style={backStyle} onClick={onBack}>
            {texts.nav.back}
          </button>
          <div
            style={{
              fontSize: 15,
              color: theme.text.secondary,
              fontWeight: theme.weight.medium,
              textAlign: "center",
              flex: "1 1 auto",
            }}
          >
            {fill(texts.nav.progress, { current: step + 1, total: TOTAL })}
          </div>
          <span style={{ minWidth: 72, flex: "0 1 auto" }} />
        </footer>
      ) : null}
    </div>
  );
}
