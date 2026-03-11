"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { AppButton } from "@shared/ui/appButton";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave?: (newValue: string) => Promise<void>;
  type?: string;
}

export default function EditableField({
  label,
  value,
  onSave,
  type,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  /* const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(currentValue);
    setIsLoading(false);
    setIsEditing(false);
  }; */

  return (
    <div className="flex justify-between items-center gap-x-4">
      <div className="flex flex-col justify-start gap-y-2">
        <p className="capitalize opacity-75">{label}</p>
        {isEditing ? (
          <input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="pb-2 h-7 w-37.5 md:w-full border-b focus:border-primary outline-none font-semibold text-xl placeholder:font-normal placeholder:opacity-80 transition-all"
            placeholder={value}
          />
        ) : (
          <p className="w-37.5 md:w-full font-semibold text-xl truncate">
            {value}
          </p>
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-4">
          <AppButton intent="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </AppButton>
          <AppButton>Save</AppButton>
        </div>
      ) : (
        <AppButton
          intent="outline"
          icon={Pencil}
          iconClasses="w-4.5 h-4.5 md:w-4 md:h-4"
          onClick={() => setIsEditing(true)}
          className="px-5"
        >
          Change
        </AppButton>
      )}
    </div>
  );
}
