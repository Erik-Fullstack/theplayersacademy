import { useState, useEffect } from "react";

import { DescriptionEditorProps } from "@/types";

export default function DescriptionEditor({
  initialValue = "",
  onChange,
}: DescriptionEditorProps) {
  const [description, setDescription] = useState<string>(initialValue);

  useEffect(() => {
    if (initialValue) {
      onChange(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="description" className="font-semibold">
        Välkomstpresentation
      </label>

      <textarea
        id="description"
        value={description}
        className="border border-gray-300 rounded-lg p-3 h-40 resize-y"
        placeholder="Skriv din text här..."
        onChange={handleChange}
      />
    </div>
  );
}
