import { ReactNode } from "react";
import clsx from "clsx";
import { Icon } from "@iconify/react";

interface FeatureCardProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  textContent?: string;
  icon?: string;
  bg?: string;
  button?: {
    label: string;
    action: () => {};
  };
}

export default function FeatureCard({
  children,
  className,
  title,
  subtitle,
  textContent,
  icon,
  button,
  bg,
}: FeatureCardProps) {
  return (
    <div className={clsx("feature-card", bg, className)}>
      {children ? (
        children
      ) : (
        <>
          {icon && <Icon icon={icon} />}
          {title && <div className="title">{title}</div>}
          {subtitle && <div className="subtitle">{subtitle}</div>}
          {textContent && <div className="text-content">{textContent}</div>}
          {button && <div>{button.label}</div>}
        </>
      )}
    </div>
  );
}
