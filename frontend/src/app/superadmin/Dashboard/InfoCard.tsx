import { Card, CardBody } from "@heroui/react";

import { superadminCardProps } from "@/types";

export default function InfoCard({
  title,
  number,
  footerText,
}: superadminCardProps) {
  return (
    <Card className="w-full bg-branding5 border-small border-branding3 shadow-md shadow-stone-300">
      <CardBody className="text-center gap-1 text-branding3">
        <p className="text-m sm:text-lg">{title}</p>
        <p className="text-3xl sm:text-5xl font-semibold ">{number}</p>
        <p className="text-m sm:text-lg">{footerText}</p>
      </CardBody>
    </Card>
  );
}
