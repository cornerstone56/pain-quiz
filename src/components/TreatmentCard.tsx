import { useState, type ReactNode } from "react";
import type { TreatmentCard as TreatmentCardModel } from "../evaluate";
import { fill, texts } from "../texts";
import { BRAND, BRAND_DARK, theme } from "../theme";

export function TreatmentCardView(props: { card: TreatmentCardModel }): ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  const { card } = props;
  const recommended = card.variant === "recommended";
  const emphasized = card.variant === "emphasized";

  let background: string = theme.bg.elevated;
  let border = `2px solid ${theme.border.default}`;
  let nameColor: string = theme.text.primary;
  let explainColor: string = theme.text.secondary;
  let textColor: string = theme.text.primary;

  if (recommended) {
    background = BRAND;
    border = `2px solid ${BRAND}`;
    nameColor = theme.text.onColor;
    explainColor = "rgba(255,255,255,0.92)";
    textColor = theme.text.onColor;
  } else if (emphasized) {
    background = "#e8f1ff";
    border = `2px solid ${BRAND}`;
    nameColor = BRAND_DARK;
    explainColor = theme.text.primary;
  }
  const detailColor = recommended ? theme.text.onColor : theme.text.primary;

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={(): void => setOpen((value) => !value)}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 16,
        border,
        background,
        color: textColor,
        padding: "14px 16px",
        boxSizing: "border-box",
        boxShadow: recommended ? "0 8px 28px rgba(30, 111, 255, 0.12)" : "none",
        fontFamily: theme.font.family,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <strong
          style={{
            fontSize: 20,
            fontWeight: theme.weight.semibold,
            letterSpacing: "-0.02em",
            color: nameColor,
            wordBreak: "keep-all",
          }}
        >
          {card.name}
        </strong>
        {card.badge ? (
          <span
            style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: theme.weight.semibold,
              lineHeight: 1,
              padding: "6px 9px",
              borderRadius: 9999,
              background: recommended ? "#fff" : BRAND,
              color: recommended ? BRAND : theme.text.onColor,
              letterSpacing: "-0.02em",
            }}
          >
            {card.badge}
          </span>
        ) : null}
        <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: theme.weight.medium, color: explainColor }}>
          {open ? texts.treatmentUi.collapse : texts.treatmentUi.expand}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, wordBreak: "keep-all", color: explainColor }}>{card.explain}</p>
      {open && card.detail ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${recommended ? "rgba(255,255,255,0.35)" : theme.border.default}`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {card.detail.map((item, index) => (
            <p key={index} style={{ margin: 0, fontSize: 16, lineHeight: 1.65, wordBreak: "keep-all", color: detailColor }}>
              {item.title ? (
                <strong style={{ fontWeight: theme.weight.semibold }}>
                  {fill(texts.treatmentUi.detailTitle, { title: item.title })}
                </strong>
              ) : null}
              {item.text}
            </p>
          ))}
        </div>
      ) : null}
    </button>
  );
}
