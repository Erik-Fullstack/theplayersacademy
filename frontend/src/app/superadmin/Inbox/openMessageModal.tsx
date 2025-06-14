import { OpenMessageProps } from "@/types";

export default function OpenMessageModal({ feedback }: OpenMessageProps) {
  return (
    <>
      <div key={feedback.id} className="mb-8 min-h-52">
        <div className="flex justify-between mb-2">
          <h4 className="flex gap-2 items-center text-lg">
            <img
              className="w-6 h-6"
              src="/Players_icon.png"
              alt="Players academy logo"
            />
            {feedback.category}
          </h4>
          <p>Rating: {feedback.rating}</p>
        </div>

        <p>{feedback.message}</p>
      </div>
    </>
  );
}
