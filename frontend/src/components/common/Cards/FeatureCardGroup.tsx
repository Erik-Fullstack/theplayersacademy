import { ReactNode } from "react";

import Section from "@/components/layout/Section";

interface FeatureCardGroupProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  maxWidth?: string;
  className?: string;
}

export default function FeatureCardGroup({
  children,
  columns = 3,
  maxWidth = "6xl",
  className,
}: FeatureCardGroupProps) {
  // Map number of columns to Tailwind classes
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <Section maxWidth={maxWidth} className={className}>
      <div className={`grid ${colClasses[columns]} gap-6`}>{children}</div>
    </Section>
  );
}
