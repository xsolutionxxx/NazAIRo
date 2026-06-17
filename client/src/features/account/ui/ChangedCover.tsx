"use client";

import { useRef, useState } from "react";
import { CloudUpload, Loader2, Check, X } from "lucide-react";

import { Container } from "@shared/ui/container";
import { cn } from "@shared/lib/utils";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks/redux";
import { uploadCover } from "@features/auth/model/authActions";

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:5000";

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${SERVER_URL}${url}`;
}

export default function ChangedCover({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const changeCoverRef = useRef<HTMLInputElement>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.authReducer);

  const resolvedCover =
    previewCover ?? resolveMediaUrl(user?.backgroundUrl) ?? "/landscape.jpg";

  const handleChangeClick = () => changeCoverRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cover = event.target.files?.[0];
    if (!cover) return;

    if (previewCover) URL.revokeObjectURL(previewCover);
    setPreviewCover(URL.createObjectURL(cover));
    setPendingFile(cover);
    event.target.value = "";
  };

  const handleSave = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const result = await dispatch(uploadCover(pendingFile)).unwrap();
      setPreviewCover(resolveMediaUrl(result.backgroundUrl));
      setPendingFile(null);
    } catch {
      // keep preview so user can retry
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewCover) URL.revokeObjectURL(previewCover);
    setPreviewCover(null);
    setPendingFile(null);
  };

  return (
    <div className="realtive mb-50">
      <div
        className={cn(
          "relative w-full h-50 overflow-hidden",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={resolvedCover}
          src={resolvedCover}
          alt="cover"
          crossOrigin={resolvedCover.startsWith("http") ? "anonymous" : undefined}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#090a0a] via-transparent to-transparent z-10" />
      </div>
      <Container className="relative">
        <input
          ref={changeCoverRef}
          onChange={handleFileChange}
          type="file"
          accept="image/*"
          className="hidden"
        />

        {/* Upload button — shown when no file selected */}
        {!pendingFile && (
          <button
            onClick={handleChangeClick}
            className="absolute left-4 -top-45 z-30 w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors"
          >
            <CloudUpload size={16} strokeWidth={1.5} />
          </button>
        )}

        {/* Save / Cancel — shown after file selected */}
        {pendingFile && (
          <div className="absolute left-4 -top-45 z-30 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors disabled:opacity-60"
              title="Save cover"
            >
              {isUploading
                ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                : <Check size={16} strokeWidth={2} />}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="w-9 h-9 rounded-full bg-destructive flex items-center justify-center shadow-md hover:bg-destructive/80 transition-colors disabled:opacity-60"
              title="Cancel"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        )}

        {children}
      </Container>
    </div>
  );
}
