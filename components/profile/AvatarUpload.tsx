"use client";

import * as React from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarCropDialog } from "./AvatarCropDialog";

interface AvatarUploadProps {
  currentAvatar: string | null;
  name: string;
  onAvatarChange: (url: string | null) => void;
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  name,
  onAvatarChange,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB.");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", croppedFile);
      if (currentAvatar) {
        formData.append("oldUrl", currentAvatar);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload avatar image.");
      }

      onAvatarChange(data.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    onAvatarChange(null);
  };

  return (
    <div className="flex items-center gap-5 font-sans">
      <div className="relative">
        {currentAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentAvatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover aspect-square border border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-semibold text-lg text-foreground uppercase border border-border shrink-0 aspect-square">
            {name ? name.charAt(0) : "U"}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-xs rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="rounded-full h-8 px-3 text-xs gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            Change photo
          </Button>

          {currentAvatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="rounded-full h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          Recommended: square image, max 2MB (PNG, JPG, WebP)
        </p>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <AvatarCropDialog
        open={isCropDialogOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setIsCropDialogOpen(false);
          setCropImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
