import { useState } from "react";

import { RatingProps } from "@/types";

export default function Rating({ value, onChange }: RatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <>
      <p className="font-semibold">Sätt ett betyg på din upplevelse:</p>

      <div className="flex flex-row gap-2 cursor-pointer">
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className="w-8 h-8"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            <img
              src="/Players_icon.png"
              alt={`rating-icon-${starValue}`}
              className={`
            w-full h-full transition filter
            ${starValue <= (hover || value) ? "grayscale-0" : "grayscale"}
          `}
            />
          </button>
        ))}
      </div>
    </>
  );
}
