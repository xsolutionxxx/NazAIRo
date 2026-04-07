"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { AppButton } from "@shared/ui/appButton";

import { useAppDispatch } from "@/shared/lib/hooks/redux";
import { updateProfile } from "@features/auth/model/authActions";

interface EditableFieldProps {
  label: string;
  name: string;
  value?: string | null;
}

export default function EditableField({
  label,
  name,
  value,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<string>(value || "");

  const dispatch = useAppDispatch();

  const handleSave = async () => {
    await dispatch(updateProfile({ [name]: currentValue })).unwrap();
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between items-center gap-x-4">
      <div className="flex flex-col justify-start gap-y-2">
        <p className="capitalize opacity-75">{label}</p>
        {isEditing ? (
          <input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="pb-2 h-7 w-37.5 md:w-full border-b focus:border-primary outline-none font-semibold text-xl placeholder:font-normal placeholder:opacity-80 transition-all"
            placeholder={value || ""}
          />
        ) : (
          <p className="w-37.5 md:w-full font-semibold text-xl truncate">
            {value}
          </p>
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-4">
          <AppButton
            intent="ghost"
            onClick={() => {
              setIsEditing(false);
              setCurrentValue(value || "");
            }}
          >
            Cancel
          </AppButton>
          <AppButton onClick={handleSave}>Save</AppButton>
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
