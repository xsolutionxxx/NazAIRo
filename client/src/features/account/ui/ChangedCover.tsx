"use client";

import { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";

import { Container } from "@shared/ui/container";
import { AppButton } from "@shared/ui/appButton";
import { cn } from "@shared/lib/utils";

export default function ChangedCover({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const changeCoverRef = useRef<HTMLInputElement>(null);

  const [previewCover, setPreviewCover] = useState<string | null>();

  const handleChangeClick = () => {
    changeCoverRef.current?.click();
  };

  const handleChangeCover = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cover = event.target.files?.[0];

    if (cover) {
      if (previewCover) {
        URL.revokeObjectURL(previewCover);
      }

      const objectCoverUrl = URL.createObjectURL(cover);
      setPreviewCover(objectCoverUrl);

      console.log("Файл готовий до відправки:", cover.name);
    }
  };

  return (
    <div className="realtive mb-50">
      <div
        className={cn(
          `relative w-full h-50 bg-center bg-cover bg-no-repeat`,
          className,
        )}
        style={{
          backgroundImage: `url(${previewCover || "/landscape.jpg"})`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-[#090a0a] via-transparent to-transparent z-10" />
      </div>
      <Container className="relative">
        <input
          ref={changeCoverRef}
          onChange={handleChangeCover}
          type="file"
          accept="image/*"
          className="hidden"
        />
        <AppButton
          onClick={handleChangeClick}
          icon={CloudUpload}
          className="absolute left-4 -top-45 p-2 z-30"
        >
          {/* Upload new cover */}
        </AppButton>
        {children}
      </Container>
    </div>
  );
}
