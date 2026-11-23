import { Fragment, type ReactNode } from "react";

/** Renders <br> and newline characters as line breaks. The rest stays plain text. */
export function RichText({ text }: { text: string }): ReactNode {
  const parts = text.split(/<br\s*\/?>|\r?\n/g);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {part}
    </Fragment>
  ));
}
