import { Card, CardBody } from "@heroui/react";

import { superadminCardProps } from "@/types";

export default function RevenueStats({
  title,
  number,
  unit,
}: superadminCardProps) {
  const formattedTotalCost = new Intl.NumberFormat("sv-SE").format(number);

  return (
    <Card className="border-branding3 border-medium shadow-md shadow-stone-300">
      <CardBody className="flex flex-row justify-between items-center">
        <p className="text-sm sm:text-lg">{title}:</p>
        <p className="text-m sm:text-2xl">
          {formattedTotalCost} {unit}
        </p>
      </CardBody>
    </Card>
  );
}
