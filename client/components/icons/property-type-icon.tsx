import type { PropertyType } from "@/lib/properties";
import { HomeIcon } from "@/components/icons/home-icon";
import { LandIcon } from "@/components/icons/land-icon";

type Props = {
  type: PropertyType;
  className?: string;
};

const iconClass = "h-[1.875rem] w-[1.875rem] shrink-0 text-primary";

/** Listing card icon: custom SVGs per property type. */
export function PropertyTypeIcon({ type, className }: Props) {
  const cls = className ?? iconClass;

  switch (type) {
    case "HOUSE":
      return <HomeIcon className={cls} />;
    case "LAND":
      return <LandIcon className={cls} />;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
