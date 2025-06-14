import { Card, CardBody, Button } from "@heroui/react";

interface OnboardingProps {
  step: number;
  stepInfo: string;
  stepImg: string;
}

export default function OnboardingStepCard({
  step,
  stepInfo,
  stepImg,
}: OnboardingProps) {
  return (
    <div className="flex flex-row items-center  ">
      <img className=" w-16 sm:w-20" src={stepImg} alt="" />
      <div className="w-6 h-px bg-branding3 mr-3" />
      <Card className="bg-branding5 shadow-md shadow-stone-300 w-full border-small border-branding3">
        <CardBody className="flex flex-col sm:flex-row gap-2">
          <p className="flex min-w-12 text-branding3 font-semibold ">
            Steg {step}
          </p>
          <p>{stepInfo}</p>
        </CardBody>
      </Card>
    </div>
  );
}
