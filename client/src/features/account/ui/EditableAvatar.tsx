"use client";

import { useRef, useState } from "react";
import { Pencil, Loader2, Check } from "lucide-react";
import { UserAvatar } from "@/shared/ui/userAvatar";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks/redux";
import { uploadAvatar } from "@features/auth/model/authActions";

const SERVER_URL = "http://localhost:5000";

export default function EditableAvatar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authReducer);

  const resolvedSrc = previewUrl
    ?? (user?.avatarUrl ? `${SERVER_URL}${user.avatarUrl}` : null);

  const handleEditClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const result = await dispatch(uploadAvatar(pendingFile)).unwrap();
      // Keep showing the image — switch preview to real server URL
      setPreviewUrl(result.avatarUrl ? `${SERVER_URL}${result.avatarUrl}` : null);
      setPendingFile(null);
    } catch {
      // keep preview so user can retry
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <UserAvatar
          src={resolvedSrc}
          className="w-40 h-40 border-4 border-accent"
        />

        <input
          ref={fileInputRef}
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="hidden"
        />

        {/* Pencil або Save — на одному місці */}
        {pendingFile ? (
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors disabled:opacity-60"
          >
            {isUploading
              ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              : <Check size={16} strokeWidth={2} />}
          </button>
        ) : (
          <button
            onClick={handleEditClick}
            className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-md hover:bg-accent/80 transition-colors"
          >
            <Pencil size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="text-center">
        <h3 className="font-bold text-xl">
          {user?.firstName} {user?.lastName}
        </h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
    </div>
  );
}
