"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => Promise<void>;
}

const VIEWPORT_SIZE = 280;
const CROP_RADIUS = 130; // 260px diameter circle inside 280px container
const OUTPUT_SIZE = 512; // 512x512 high-resolution 1:1 square crop

export function AvatarCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: AvatarCropDialogProps) {
  const [zoom, setZoom] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [imageSize, setImageSize] = React.useState<{ width: number; height: number } | null>(null);

  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const isDraggingRef = React.useRef(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });

  // Reset controls when a new image is loaded
  React.useEffect(() => {
    if (open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setIsProcessing(false);
    }
  }, [open, imageSrc]);

  // Compute base dimensions to cover the crop circle
  const baseScale = React.useMemo(() => {
    if (!imageSize) return 1;
    const targetDiameter = CROP_RADIUS * 2;
    return Math.max(
      targetDiameter / imageSize.width,
      targetDiameter / imageSize.height
    );
  }, [imageSize]);

  const currentScale = baseScale * zoom;
  const displayWidth = imageSize ? imageSize.width * currentScale : VIEWPORT_SIZE;
  const displayHeight = imageSize ? imageSize.height * currentScale : VIEWPORT_SIZE;

  // Clamping drag offset so the crop circle never samples outside the image
  const clampOffset = React.useCallback(
    (newX: number, newY: number) => {
      const maxOffsetX = Math.max(0, (displayWidth - CROP_RADIUS * 2) / 2);
      const maxOffsetY = Math.max(0, (displayHeight - CROP_RADIUS * 2) / 2);
      return {
        x: Math.min(maxOffsetX, Math.max(-maxOffsetX, newX)),
        y: Math.min(maxOffsetY, Math.max(-maxOffsetY, newY)),
      };
    },
    [displayWidth, displayHeight]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const nextX = e.clientX - dragStartRef.current.x;
    const nextY = e.clientY - dragStartRef.current.y;
    setOffset(clampOffset(nextX, nextY));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already lost
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((prev) => Math.min(3, Math.max(1, prev + delta)));
    setOffset((prev) => clampOffset(prev.x, prev.y));
  };

  const handleApplyCrop = async () => {
    if (!imageRef.current || !imageSize) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create canvas rendering context");
      }

      // Smooth image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Ratio between canvas output size and crop diameter
      const scaleToCanvas = OUTPUT_SIZE / (CROP_RADIUS * 2);

      // Center offset from viewport center to crop center
      const cropCenterX = VIEWPORT_SIZE / 2;
      const cropCenterY = VIEWPORT_SIZE / 2;

      // Top-left coordinate of the crop circle in viewport space
      const cropBoxLeft = cropCenterX - CROP_RADIUS;
      const cropBoxTop = cropCenterY - CROP_RADIUS;

      // Top-left coordinate of image in viewport space
      const imageLeft = VIEWPORT_SIZE / 2 - displayWidth / 2 + offset.x;
      const imageTop = VIEWPORT_SIZE / 2 - displayHeight / 2 + offset.y;

      // Draw relative to canvas (0,0)
      const dx = (imageLeft - cropBoxLeft) * scaleToCanvas;
      const dy = (imageTop - cropBoxTop) * scaleToCanvas;
      const dWidth = displayWidth * scaleToCanvas;
      const dHeight = displayHeight * scaleToCanvas;

      ctx.drawImage(imageRef.current, dx, dy, dWidth, dHeight);

      // Export as a high-quality JPEG File
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const croppedFile = new File([blob], "avatar.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          await onCropComplete(croppedFile);
          setIsProcessing(false);
          onClose();
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Failed to crop avatar:", err);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-[360px] p-6 font-sans rounded-3xl">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-base font-semibold">
            Crop Profile Photo
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag to center and use the slider to zoom into the circle.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 flex flex-col items-center space-y-4">
          {/* Interactive Crop Viewport */}
          <div
            className="relative overflow-hidden rounded-2xl bg-neutral-950 border border-border select-none touch-none cursor-grab active:cursor-grabbing"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                crossOrigin="anonymous"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImageSize({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  });
                }}
                className="absolute top-0 left-0 pointer-events-none max-w-none origin-top-left transition-transform duration-75 ease-out"
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  transform: `translate3d(${VIEWPORT_SIZE / 2 - displayWidth / 2 + offset.x}px, ${VIEWPORT_SIZE / 2 - displayHeight / 2 + offset.y}px, 0)`,
                }}
              />
            )}

            {/* Circular Crop Mask Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
            >
              <defs>
                <mask id="avatar-crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <circle
                    cx={VIEWPORT_SIZE / 2}
                    cy={VIEWPORT_SIZE / 2}
                    r={CROP_RADIUS}
                    fill="black"
                  />
                </mask>
              </defs>
              {/* Darkened backdrop outside the crop circle */}
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.65)"
                mask="url(#avatar-crop-mask)"
              />
              {/* Circular border guide */}
              <circle
                cx={VIEWPORT_SIZE / 2}
                cy={VIEWPORT_SIZE / 2}
                r={CROP_RADIUS}
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-80"
              />
            </svg>
          </div>

          {/* Zoom Slider Control */}
          <div className="w-full flex items-center gap-3 px-1 pt-1">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => {
                const nextZoom = parseFloat(e.target.value);
                setZoom(nextZoom);
                setOffset((prev) => clampOffset(prev.x, prev.y));
              }}
              disabled={isProcessing}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApplyCrop}
            disabled={isProcessing || !imageSize}
            className="rounded-full text-xs"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Processing…
              </>
            ) : (
              "Apply & Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
