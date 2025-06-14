import { Card, CardBody, CardHeader } from "@heroui/react";

import { OpenMessageProps } from "@/types";

export default function OpenMessage({ feedback }: OpenMessageProps) {
  return (
    <>
      <Card
        key={feedback.id}
        className="w-96 p-4 hidden md:flex border-small border-red-800"
      >
        <CardHeader className="flex justify-between">
          <h4 className="flex gap-2 items-center text-lg">
            <img
              className="w-6 h-6"
              src="/Players_icon.png"
              alt="Players academy logo"
            />
            {feedback.category}
          </h4>
          <p>Rating: {feedback.rating}</p>
        </CardHeader>
        <CardBody>{feedback.message}</CardBody>
      </Card>
    </>
  );
}
