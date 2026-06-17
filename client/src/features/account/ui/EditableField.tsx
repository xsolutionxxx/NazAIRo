"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { AppButton } from "@shared/ui/appButton";
import { useAppDispatch } from "@/shared/lib/hooks/redux";
import { updateProfile } from "@features/auth/model/authActions";
import { profileSchema } from "@shared/schemas/user-schema";
import { InputErrorMessage } from "@shared/ui/inputErrorMessage";

interface EditableFieldProps {
  label: string;
  name: string;
  value?: string | null;
}

export default function EditableField({ label, name, value }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  // savedValue tracks what was last successfully saved (falls back to prop)
  const [savedValue, setSavedValue] = useState<string>(value || "");
  const [currentValue, setCurrentValue] = useState<string>(value || "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useAppDispatch();

  const handleSave = async () => {
    const result = profileSchema.partial().safeParse({ [name]: currentValue });

    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      setError(errorMap[name as keyof typeof errorMap]?.[0] || "Invalid format");
      return;
    }

    try {
      setError(null);
      setIsSaving(true);
      await dispatch(updateProfile({ [name]: currentValue })).unwrap();
      setSavedValue(currentValue);
      setIsEditing(false);
    } catch {
      setError("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentValue(savedValue);
    setError(null);
  };

  return (
    <div className="flex justify-between items-center gap-x-4">
      <div className="flex flex-col justify-start gap-y-2 min-w-0 flex-1">
        <p className="capitalize opacity-75">{label}</p>
        {isEditing ? (
          <div className="relative flex flex-col gap-y-1">
            <input
              value={currentValue}
              placeholder={label}
              onChange={(e) => {
                setCurrentValue(e.target.value);
                if (error) setError(null);
              }}
              className={`pb-2 h-7 w-full border-b outline-none font-semibold text-xl transition-all ${
                error
                  ? "border-destructive text-destructive"
                  : "border-gray-300 focus:border-primary"
              }`}
              autoFocus
            />
            {error && (
              <InputErrorMessage message={error} className="-bottom-6.5 left-0" />
            )}
          </div>
        ) : (
          <p className="w-full font-semibold text-xl truncate leading-tight">
            {savedValue}
          </p>
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-4">
          <AppButton intent="ghost" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </AppButton>
        </div>
      ) : (
        <AppButton
          intent="outline"
          icon={Pencil}
          iconClasses="w-4.5 h-4.5 md:w-4 md:h-4"
          onClick={() => setIsEditing(true)}
          className="px-3 sm:px-5 shrink-0"
        >
          <span className="hidden sm:inline">Change</span>
        </AppButton>
      )}
    </div>
  );
}
