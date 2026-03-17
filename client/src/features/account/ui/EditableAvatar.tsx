"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { UserAvatar } from "@/shared/ui/userAvatar";
import { AppButton } from "@/shared/ui/appButton";
import { cn } from "@shared/lib/utils";

export default function EditableAvatar() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleEditClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      console.log("Файл готовий до відправки:", file.name);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <UserAvatar
          src={previewUrl}
          className="w-40 h-40 border-4 border-accent"
        />

        <input
          ref={fileInputRef}
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="hidden"
        />

        <AppButton
          onClick={handleEditClick}
          icon={Pencil}
          className="absolute bottom-1 right-1 p-2.5 lg:px-2.5 rounded-full bg-accent"
        />
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl">John Doe</h3>
        <p className="text-sm text-muted-foreground">john.doe@gmail.com</p>
      </div>
    </div>
  );
}
