import { Card, CardBody, CardHeader } from "@heroui/react";

import { IFeedback } from "@/types";
import { InboxProps } from "@/types";

export default function MessageList({
  feedback,
  onOpen,
  selected,
}: InboxProps) {
  const renderMessageItem = (msg: IFeedback) => (
    <button key={msg.id} onClick={() => onOpen(msg)}>
      <Card
        className={`cursor-pointer p-3 w-full ${
          selected && selected.id === msg.id
            ? "bg-white text-black border-small border-red-800"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        <CardHeader className="pb-0 flex items-center justify-between">
          <h4 className="flex items-center text-xl">
            <img
              className="w-5 h-5 mr-2"
              src="/Players_icon.png"
              alt="Players academy logo"
            />
            {msg.category}
          </h4>
          <p className="font-extralight text-small">
            {new Date(msg.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardBody>
          <p className="line-clamp-1">{msg.message}</p>
        </CardBody>
      </Card>
    </button>
  );

  const isEmpty = feedback.length === 0;

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {feedback.map(renderMessageItem)}
      </div>

      <div className="hidden md:flex md:flex-col md:w-80 gap-3">
        {feedback.map(renderMessageItem)}
      </div>
    </>
  );
}
