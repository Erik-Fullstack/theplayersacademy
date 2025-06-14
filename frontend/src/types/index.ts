export * from "./common";
export * from "./components";
export * from "./models";
export * from "./navigation";

import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
