import { HighlightBedIcon } from "@/components/icons/highlight-bed-icon";
import { HighlightExpandIcon } from "@/components/icons/highlight-expand-icon";

const defaultSvgClass =
  "h-[1.125rem] w-[1.125rem] shrink-0 text-primary/80";
const defaultSymbolClass =
  "material-symbols-outlined !text-[1.125rem] !leading-none text-primary/80 shrink-0";

type Props = {
  /** Material symbol name from listing highlights (e.g. `aspect_ratio`, `square_foot`). */
  name: string;
  /** Classes for inline SVGs (`currentColor`). */
  svgClassName?: string;
  /** Classes when falling back to Material Symbols. */
  symbolClassName?: string;
};

/** Maps known highlight keys to custom SVGs; otherwise renders a Material glyph. */
export function HighlightIcon({
  name,
  svgClassName = defaultSvgClass,
  symbolClassName = defaultSymbolClass,
}: Props) {
  if (name === "aspect_ratio") {
    return <HighlightExpandIcon className={svgClassName} />;
  }
  if (name === "meeting_room") {
    return <HighlightBedIcon className={svgClassName} />;
  }
  return (
    <span className={symbolClassName} aria-hidden>
      {name}
    </span>
  );
}
