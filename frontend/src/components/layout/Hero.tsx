import { ReactNode } from "react";
import clsx from "clsx";

interface HeroProps {
  children: ReactNode;
  className?: string;
  minHeight?:
    | "2xs"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "screen"
    | "full";
  top?: boolean;
  dark?: boolean;
  light?: boolean;
  bgImg?: string;
  overlay?: string;
  imageFilter?: string;
  fullWidth?: boolean;
}

export default function Hero({
  children,
  className,
  minHeight,
  top = false,
  dark,
  light,
  bgImg,
  overlay, // e.g. "bg-green-700/50"
  imageFilter,
  fullWidth = false,
}: HeroProps) {
  const minHeightClasses = {
    "2xs": "min-h-[8rem]",
    xs: "min-h-[16rem]",
    sm: "min-h-[24rem]",
    md: "min-h-[32rem]",
    lg: "min-h-[40rem]",
    xl: "min-h-[48rem]",
    "2xl": "min-h-[56rem]",
    full: "min-h-full",
    screen: "min-h-screen",
  };

  return (
    <div
      className={clsx(
        "hero relative",
        {
          "text-white": dark,
          "text-black": light,
          top: top,
        },
        minHeight && minHeightClasses[minHeight],
        className,
      )}
    >
      {bgImg && (
        <>
          {/* Background image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
              backgroundImage: `url(${bgImg})`,
              filter: imageFilter || "none",
            }}
          />

          {/* Color overlay */}
          {overlay && <div className={clsx("absolute inset-0 z-0", overlay)} />}
        </>
      )}
      {/* Content */}
      <div
        className={clsx("relative z-10 h-full", {
          "w-full": fullWidth,
          "container mx-auto px-4": !fullWidth,
        })}
      >
        {children}
      </div>
    </div>
  );
}
