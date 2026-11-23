import type { ReactNode } from "react";
import { FIG_H, FIG_SRC, FIG_W, NECK_HIT, POLYS, neckArea, type AreaId, type View } from "../areas";
import { texts } from "../texts";
import { BRAND } from "../theme";

export function BodyFigure(props: {
  view: View;
  selected: AreaId[];
  onToggle?: (area: AreaId) => void;
}): ReactNode {
  const { view, selected, onToggle } = props;
  const interactive = !!onToggle;
  const paths: ReactNode[] = [];
  POLYS[view].forEach((poly, index) => {
    const on = selected.includes(poly.id);
    paths.push(
      <path
        key={`p-${index}`}
        d={poly.d}
        fill={BRAND}
        fillOpacity={on ? 0.5 : 0}
        stroke={on ? BRAND : "rgba(30, 111, 255, 0.22)"}
        strokeWidth={on ? 2 : 1.2}
        strokeLinejoin="round"
        style={{
          cursor: interactive ? "pointer" : "default",
          pointerEvents: interactive ? "all" : "none",
          transition: "fill-opacity 0.15s ease",
        }}
        onClick={
          interactive
            ? (): void => {
                if (onToggle) onToggle(poly.id);
              }
            : undefined
        }
      />,
    );
  });
  if (interactive) {
    paths.push(
      <path
        key="neck-hit"
        d={NECK_HIT}
        fill="transparent"
        style={{ cursor: "pointer", pointerEvents: "all" }}
        onClick={(): void => {
          if (onToggle) onToggle(neckArea(view));
        }}
      />,
    );
  }
  const copy = texts.questions.areas;
  return (
    <div
      data-view={view}
      style={{
        position: "relative",
        width: "100%",
        background: "#ffffff",
        borderRadius: 14,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <img
        src={FIG_SRC[view]}
        alt={view === "front" ? copy.frontImageAlt : copy.backImageAlt}
        draggable={false}
        style={{ display: "block", width: "100%", height: "auto", aspectRatio: `${FIG_W} / ${FIG_H}` }}
      />
      <svg
        viewBox={`0 0 ${FIG_W} ${FIG_H}`}
        preserveAspectRatio="xMidYMin meet"
        style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", touchAction: "manipulation" }}
        role="img"
        aria-label={view === "front" ? copy.frontAria : copy.backAria}
      >
        {paths}
      </svg>
    </div>
  );
}
