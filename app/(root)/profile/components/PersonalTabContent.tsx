"use client";

import * as React from "react";
import Link from "next/link";
import { Camera, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarCropDialog } from "@/components/profile/AvatarCropDialog";

interface PersonalTabContentProps {
  name: string;
  setName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  avatar: string | null;
  onAvatarChange: (newUrl: string | null) => Promise<void>;
  isAvatarUpdating: boolean;
  username: string;
  email: string;
  isChanged: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function PersonalTabContent({
  name,
  setName,
  bio,
  setBio,
  avatar,
  onAvatarChange,
  isAvatarUpdating,
  username,
  email,
  isChanged,
  isSaving,
  onSave,
  onReset,
}: PersonalTabContentProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be smaller than 10MB.");
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropDialogOpen(true);
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file.");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", croppedFile);
      if (avatar) {
        formData.append("oldUrl", avatar);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image.");
      }

      await onAvatarChange(data.data.url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload photo."
      );
      throw err;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveAvatar = async () => {
    await onAvatarChange(null);
  };

  const isLoading = isAvatarUpdating || isUploadingFile;

  return (
    <div className="space-y-8 font-sans">
      {/* Avatar Section (Independent from Save/Cancel) */}
      <div className="flex items-center gap-5 pb-6 border-b border-border/50">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="relative shrink-0">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover aspect-square border border-border shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-medium text-base text-foreground uppercase border border-border shrink-0 aspect-square">
              {name ? name.charAt(0) : "U"}
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 rounded-full bg-background/60 backdrop-blur-xs flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full h-8 px-3 text-xs gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <span>{avatar ? "Change photo" : "Upload photo"}</span>
            </Button>

            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={handleRemoveAvatar}
                className="rounded-full h-8 px-3 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {uploadError ? (
              <span className="text-destructive font-medium">{uploadError}</span>
            ) : (
              "JPG, PNG or GIF. Max 2MB."
            )}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="input-name" className="text-xs font-medium text-foreground">
            Name
          </Label>
          <Input
            id="input-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
            placeholder="Your name"
            className="h-10 rounded-xl text-sm max-w-lg"
          />
        </div>

        {/* Username with Link to Visit Public Profile */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between max-w-lg">
            <Label htmlFor="input-username" className="text-xs font-medium text-foreground">
              Username
            </Label>
            {username && (
              <Link
                href={`/users/${username}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                <span>View public profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
          <Input
            id="input-username"
            value={username}
            disabled
            className="h-10 rounded-xl text-sm max-w-lg bg-muted/20 cursor-not-allowed opacity-75 font-mono text-xs"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="input-email" className="text-xs font-medium text-foreground">
            Email
          </Label>
          <Input
            id="input-email"
            value={email}
            disabled
            className="h-10 rounded-xl text-sm max-w-lg bg-muted/20 cursor-not-allowed opacity-75"
          />
        </div>

        {/* Bio with min-height */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between max-w-lg">
            <Label htmlFor="input-bio" className="text-xs font-medium text-foreground">
              Bio
            </Label>
            <span className="text-[11px] text-muted-foreground">
              {bio.length} / 500
            </span>
          </div>
          <textarea
            id="input-bio"
            rows={4}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={isSaving}
            placeholder="A short bio about yourself..."
            className="w-full max-w-lg min-h-[130px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* Action Buttons (Strictly for text changes) */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-border/50">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isChanged || isSaving}
          className="h-9 px-5 rounded-full text-xs font-medium cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>

        {isChanged && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isSaving}
            className="h-9 px-4 rounded-full text-xs cursor-pointer"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Image Crop Dialog */}
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
