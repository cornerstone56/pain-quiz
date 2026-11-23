import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { texts } from "../texts";
import { BRAND, BRAND_DEEP, DISABLED_BG, theme } from "../theme";

function valueFromClientX(track: HTMLDivElement, clientX: number): number {
  const rect = track.getBoundingClientRect();
  const t = rect.width ? (clientX - rect.left) / rect.width : 0;
  return Math.max(0, Math.min(10, Math.round(t * 10)));
}

export function PainRuler(props: {
  value: number | undefined;
  onChange: (n: number) => void;
  onNext: () => void;
}): ReactNode {
  const current: number | null = typeof props.value === "number" ? props.value : null;
  const has = current !== null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    props.onChange(valueFromClientX(event.currentTarget, event.clientX));
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.preventDefault();
    props.onChange(valueFromClientX(event.currentTarget, event.clientX));
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const ticks: ReactNode[] = [];
  const nums: ReactNode[] = [];
  for (let n = 0; n <= 10; n += 1) {
    const left = (n / 10) * 100;
    const isMajor = n % 5 === 0;
    const isEnd0 = n === 0;
    const isEnd10 = n === 10;
    ticks.push(
      <span
        key={`tick-${n}`}
        style={{
          position: "absolute",
          top: 0,
          left: `${left}%`,
          width: isEnd0 || isEnd10 ? 3 : isMajor ? 2.5 : 2,
          height: isMajor || isEnd0 || isEnd10 ? "100%" : 22,
          background: isMajor || isEnd0 || isEnd10 ? BRAND_DEEP : "#12315c",
          borderRadius: isEnd0 ? "6px 0 0 6px" : isEnd10 ? "0 6px 6px 0" : 1,
          transform: isEnd0 ? "none" : isEnd10 ? "translateX(-100%)" : "translateX(-50%)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.55)",
          pointerEvents: "none",
        }}
      />,
    );
    if (n < 10) {
      ticks.push(
        <span
          key={`mid-${n}`}
          style={{
            position: "absolute",
            top: 0,
            left: `${left + 5}%`,
            width: 1.5,
            height: 12,
            background: "rgba(18, 49, 92, 0.55)",
            borderRadius: 1,
            transform: "translateX(-50%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.35)",
            pointerEvents: "none",
          }}
        />,
      );
    }
    nums.push(
      <span
        key={`num-${n}`}
        style={{
          position: "absolute",
          top: 0,
          left: `${left}%`,
          transform: "translateX(-50%)",
          fontSize: "clamp(12px, 3.3vw, 16px)",
          fontWeight: current === n ? theme.weight.semibold : theme.weight.medium,
          color: current === n ? BRAND_DEEP : theme.text.secondary,
          lineHeight: "28px",
        }}
      >
        {n}
      </span>,
    );
  }

  const nextDisabled = !has;
  const nextStyle: CSSProperties = {
    margin: "0 auto",
    display: "block",
    width: "100%",
    maxWidth: 360,
    minHeight: 64,
    border: 0,
    borderRadius: 20,
    background: nextDisabled ? DISABLED_BG : BRAND,
    color: theme.text.onColor,
    fontFamily: theme.font.family,
    fontSize: 22,
    fontWeight: theme.weight.semibold,
    cursor: nextDisabled ? "default" : "pointer",
    boxShadow: nextDisabled ? "none" : "0 8px 28px rgba(30, 111, 255, 0.12)",
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 28 }}>
      <div style={{ width: "100%", userSelect: "none" }}>
        <div style={{ position: "relative", padding: "58px 16px 0" }}>
          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={has ? (current ?? 0) : undefined}
            aria-label={texts.questions.pain.aria}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: "relative",
              height: 56,
              touchAction: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 40,
                borderRadius: 6,
                background: "linear-gradient(90deg, #d6e8ff 0%, #8fb6ff 40%, #1e6fff 75%, #0b3d9e 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 8px rgba(30, 111, 255, 0.16)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 40,
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              {ticks}
            </div>
            {current !== null ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${(current / 10) * 100}%`,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#fff",
                  border: `3px solid ${BRAND_DEEP}`,
                  boxShadow: "0 4px 14px rgba(11, 61, 158, 0.35)",
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  zIndex: 2,
                  transition: "left 0.16s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "calc(100% + 14px)",
                    transform: "translateX(-50%)",
                    minWidth: 48,
                    height: 44,
                    padding: "0 10px",
                    borderRadius: 14,
                    background: BRAND,
                    color: theme.text.onColor,
                    fontSize: 28,
                    fontWeight: theme.weight.semibold,
                    lineHeight: "44px",
                    textAlign: "center",
                    boxShadow: "0 8px 28px rgba(30, 111, 255, 0.12)",
                  }}
                >
                  {current}
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "100%",
                      marginLeft: -6,
                      border: "6px solid transparent",
                      borderTopColor: BRAND,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div style={{ position: "relative", height: 28, marginTop: 8 }}>{nums}</div>
        </div>
        <div style={{ position: "relative", height: 38, marginTop: 2, padding: "0 16px" }}>
          <span
            style={{
              position: "absolute",
              left: 16,
              top: 0,
              fontSize: "clamp(12px, 3.2vw, 15px)",
              fontWeight: theme.weight.semibold,
              color: theme.text.secondary,
              wordBreak: "keep-all",
              lineHeight: 1.35,
              maxWidth: "5.8em",
            }}
          >
            {texts.questions.pain.none}
          </span>
          <span
            style={{
              position: "absolute",
              right: 16,
              top: 0,
              textAlign: "right",
              fontSize: "clamp(12px, 3.2vw, 15px)",
              fontWeight: theme.weight.semibold,
              color: theme.text.secondary,
              wordBreak: "keep-all",
              lineHeight: 1.35,
              maxWidth: "5.8em",
            }}
          >
            {texts.questions.pain.worst}
          </span>
        </div>
      </div>
      <button type="button" style={nextStyle} disabled={nextDisabled} onClick={props.onNext}>
        {texts.nav.next}
      </button>
    </div>
  );
}
