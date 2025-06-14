import { ReactNode, ElementType } from "react";
import clsx from "clsx";

interface SectionProps {
  children: ReactNode;
  maxWidth?: string;
  section?: boolean;
  className?: string;
  classes?: {
    innerContainer?: string;
  };
  as?: ElementType;
}

export default function Section({
  children,
  maxWidth = "3xl",
  section = false,
  as,
  className,
  classes,
}: SectionProps) {
  const Component = as || (section ? "section" : "div");

  return (
    <Component className={clsx("section", className)}>
      <div
        className={clsx(
          "inner-container w-full h-full overflow-visible mx-auto p-12",
          `max-w-${maxWidth}`,
          classes?.innerContainer,
        )}
      >
        {children}
      </div>
    </Component>
  );
}
