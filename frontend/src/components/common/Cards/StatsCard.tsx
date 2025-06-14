import { ReactNode } from "react";
import { Button } from "@heroui/react";
import clsx from "clsx";

interface Props {
  className?: string;
  children: ReactNode;
  centered?: boolean;
  buttons?: {
    label: string;
    classes?: string;
    action?: () => void;
  }[];
}

export default function StatsCard({
  buttons,
  children,
  className,
  centered,
}: Props) {
  const isSingleButton = buttons && buttons.length === 1;

  return (
    <div
      className={clsx(
        "p-4 rounded-[8px] flex flex-col",
        !className && "bg-branding4",
        className,
      )}
    >
      <div
        className={clsx(
          "flex-1 flex flex-col",
          centered && " justify-center items-center",
        )}
      >
        {children}
      </div>
      {buttons && (
        <div
          className={clsx(
            "grid gap-2 mt-4",
            isSingleButton
              ? "grid-cols-1 mx-auto w-fit"
              : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {buttons.map((btn) => (
            <Button
              key={btn.label}
              color="primary"
              radius="full"
              className={clsx("bg-branding3", btn.classes)}
              onPress={btn.action}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
