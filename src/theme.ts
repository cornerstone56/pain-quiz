/** Light theme baked into the live GitHub Pages bundle. */
export const BRAND = "#1E6FFF";
export const BRAND_DARK = "#1458d4";
export const BRAND_DEEP = "#0b3d9e";
export const SOFT_BLUE = "#e8f1ff";
export const CHOICE_BORDER = "#e6ebf2";
export const DISABLED_BG = "#c5d4ee";

export const theme = {
  bg: { base: "#ffffff", elevated: "#f7f9fc" },
  border: { default: "#e3e8ef" },
  font: {
    family: '"Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif',
  },
  text: {
    primary: "#111827",
    secondary: "#5b6472",
    tertiary: "#8a93a1",
    onColor: "#ffffff",
  },
  weight: { medium: 500 as const, semibold: 700 as const },
};

export const canvasFont = theme.font.family;
