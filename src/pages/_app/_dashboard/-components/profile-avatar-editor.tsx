"use client";

import {
  ArrowLeftIcon,
  CircleUserRoundIcon,
  ImagePlus,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFileUpload } from "@/shared/hooks/use-file-upload";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getInitialName } from "@/lib/get-initial-name";
import { Button } from "@/shared/components/ui/button";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/shared/components/ui/cropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Slider } from "@/shared/components/ui/slider";

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height,
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    return null;
  }
}

interface ProfileAvatarEditorProps {
  currentAvatar?: string | null;
  userName: string;
  isEditable: boolean;
  isAvatarRemoved?: boolean;
  onAvatarChange?: (blob: Blob | null) => void;
  onAvatarRemove?: () => void;
}

export function ProfileAvatarEditor({
  currentAvatar,
  userName,
  isEditable,
  isAvatarRemoved = false,
  onAvatarChange,
  onAvatarRemove,
}: ProfileAvatarEditorProps) {
  const { t } = useTranslation();
  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  });
  const [_croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const previousFileIdRef = useRef<string | undefined | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [zoom, setZoom] = useState(1);
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      console.error("Missing data for apply:", {
        croppedAreaPixels,
        fileId,
        previewUrl,
      });
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }
    try {
      const blob = await getCroppedImg(previewUrl, croppedAreaPixels);
      if (!blob) {
        throw new Error("Failed to generate cropped image blob.");
      }
      setCroppedBlob(blob);
      const newFinalUrl = URL.createObjectURL(blob);
      if (finalImageUrl) {
        URL.revokeObjectURL(finalImageUrl);
      }
      setFinalImageUrl(newFinalUrl);
      onAvatarChange?.(blob);
      removeFile(fileId);
      setCroppedAreaPixels(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error during apply:", error);
    }
  };

  const handleRemoveFinalImage = () => {
    if (finalImageUrl) {
      URL.revokeObjectURL(finalImageUrl);
    }
    setFinalImageUrl(null);
    setCroppedBlob(null);
    onAvatarChange?.(null);
    onAvatarRemove?.();
  };

  const handleCleanup = useCallback(() => {
    if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(finalImageUrl);
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFinalImageUrl(null);
    setCroppedAreaPixels(null);
    setCroppedBlob(null);
    onAvatarChange?.(null);
    if (fileId) {
      removeFile(fileId);
    }
  }, [finalImageUrl, previewUrl, fileId, removeFile, onAvatarChange]);

  useEffect(() => {
    if (!isEditable) {
      handleCleanup();
    }
  }, [isEditable, handleCleanup]);

  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      if (currentFinalUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  useEffect(() => {
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true);
      setCroppedAreaPixels(null);
      setZoom(1);
    }
    previousFileIdRef.current = fileId;
  }, [fileId]);

  const displayImage = isAvatarRemoved ? null : finalImageUrl || currentAvatar;

  return (
    <div className="flex items-center gap-4">
      <div className="relative inline-flex">
        {isEditable ? (
          <button
            aria-label={displayImage ? "Change image" : "Upload image"}
            className="relative flex size-25 items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-[img]:border-none has-disabled:opacity-50 data-[dragging=true]:bg-accent/50"
            data-dragging={isDragging || undefined}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button[type="button"]')) {
                return;
              }
              openFileDialog();
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            type="button"
          >
            {displayImage ? (
              <img
                alt="User avatar"
                className="size-full object-cover"
                height={80}
                src={displayImage}
                style={{ objectFit: "cover" }}
                width={80}
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex items-center justify-center"
              >
                <CircleUserRoundIcon className="size-8 opacity-60" />
              </div>
            )}
          </button>
        ) : (
          <Avatar className="w-25 h-25">
            <AvatarImage src={currentAvatar ?? ""} alt={userName} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {getInitialName(userName)}
            </AvatarFallback>
          </Avatar>
        )}

        {isEditable && (
          <Button
            aria-label="Change avatar"
            className="absolute cursor-pointer bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
            size={"icon"}
            type="button"
          >
            <ImagePlus className="size-3.5" />
          </Button>
        )}

        {isEditable && (finalImageUrl || currentAvatar) && (
          <Button
            aria-label="Remove image"
            className="-top-0 -right-0 absolute size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFinalImage();
            }}
            size="icon"
            type="button"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}

        {isEditable && (
          <input
            {...getInputProps()}
            aria-label="Upload image file"
            className="sr-only"
            tabIndex={-1}
          />
        )}
      </div>

      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            {t("cropper.dialog.description")}
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  aria-label="Cancel"
                  className="-my-1 opacity-60"
                  onClick={() => {
                    setIsDialogOpen(false);
                    if (fileId) {
                      removeFile(fileId);
                      setCroppedAreaPixels(null);
                    }
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>{t("cropper.dialog.title")}</span>
              </div>
              <Button
                autoFocus
                className="-my-1"
                disabled={!previewUrl}
                onClick={handleApply}
              >
                {t("cropper.dialog.apply")}
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Cropper
              className="h-96 sm:h-120"
              image={previewUrl}
              onCropChange={handleCropChange}
              onZoomChange={setZoom}
              zoom={zoom}
            >
              <CropperDescription />
              <CropperImage />
              <CropperCropArea />
            </Cropper>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <ZoomOutIcon
                aria-hidden="true"
                className="shrink-0 opacity-60"
                size={16}
              />
              <Slider
                aria-label="Zoom slider"
                defaultValue={[1]}
                max={3}
                min={1}
                onValueChange={(value) => setZoom(value[0])}
                step={0.1}
                value={[zoom]}
              />
              <ZoomInIcon
                aria-hidden="true"
                className="shrink-0 opacity-60"
                size={16}
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
