"use client";

import {
  ArrowLeftIcon, CircleUserRoundIcon,
  ImagePlus, XIcon,
  ZoomInIcon,
  ZoomOutIcon
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useFileUpload } from "@/hooks/use-file-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitialName } from "@/lib/get-initial-name";
import { Button } from "@/components/ui/button";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number };

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Needed for canvas Tainted check
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width, // Optional: specify output size
  outputHeight: number = pixelCrop.height,
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    // Set canvas size to desired output size
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth, // Draw onto the output size
      outputHeight,
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg"); // Specify format and quality if needed
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
  isAvatarRemoved?: boolean; // New prop to track if avatar was marked for removal
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

  // Store the cropped blob for later upload
  const [_croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ref to track the previous file ID to detect new uploads
  const previousFileIdRef = useRef<string | undefined | null>(null);

  // State to store the desired crop area in pixels
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // State for zoom level
  const [zoom, setZoom] = useState(1);

  // Callback for Cropper to provide crop data - Wrap with useCallback
  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    // Check if we have the necessary data
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      console.error("Missing data for apply:", {
        croppedAreaPixels,
        fileId,
        previewUrl,
      });
      // Remove file if apply is clicked without crop data?
      if (fileId) {
        removeFile(fileId);
        setCroppedAreaPixels(null);
      }
      return;
    }

    try {
      // 1. Get the cropped image blob using the helper
      const blob = await getCroppedImg(previewUrl, croppedAreaPixels);

      if (!blob) {
        throw new Error("Failed to generate cropped image blob.");
      }

      // 2. Store the blob for later upload
      setCroppedBlob(blob);

      // 3. Create a NEW object URL from the cropped blob for display
      const newFinalUrl = URL.createObjectURL(blob);

      // 4. Revoke the OLD finalImageUrl if it exists
      if (finalImageUrl) {
        URL.revokeObjectURL(finalImageUrl);
      }

      // 5. Set the final avatar state to the NEW URL
      setFinalImageUrl(newFinalUrl);

      // 6. Notify parent component about the new blob
      onAvatarChange?.(blob);

      // 7. Remove the temporary file
      removeFile(fileId);
      setCroppedAreaPixels(null);

      // 8. Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error during apply:", error);
      // Keep dialog open on error so user can retry
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

  // Cleanup function called when edit mode is cancelled
  const handleCleanup = useCallback(() => {
    // Revoke all blob URLs
    if (finalImageUrl && finalImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(finalImageUrl);
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset state
    setFinalImageUrl(null);
    setCroppedAreaPixels(null);
    setCroppedBlob(null);

    // Notify parent component that avatar was cancelled
    onAvatarChange?.(null);

    // Remove any files
    if (fileId) {
      removeFile(fileId);
    }
  }, [finalImageUrl, previewUrl, fileId, removeFile, onAvatarChange]);

  // Call cleanup when onCleanup is triggered (when edit mode is cancelled)
  useEffect(() => {
    if (!isEditable) {
      handleCleanup();
    }
  }, [isEditable, handleCleanup]);

  // Cleanup on unmount
  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      if (currentFinalUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(currentFinalUrl);
      }
    };
  }, [finalImageUrl]);

  // Effect to open dialog when a *new* file is ready
  useEffect(() => {
    // Check if fileId exists and is different from the previous one
    if (fileId && fileId !== previousFileIdRef.current) {
      setIsDialogOpen(true); // Open dialog for the new file
      setCroppedAreaPixels(null); // Reset crop area for the new file
      setZoom(1); // Reset zoom for the new file
    }
    // Update the ref to the current fileId for the next render
    previousFileIdRef.current = fileId;
  }, [fileId]); // Depend only on fileId

  // Display image: either the newly cropped one, or current avatar (unless removed)
  const displayImage = isAvatarRemoved ? null : (finalImageUrl || currentAvatar);

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Display / Upload Button */}
      <div className="relative inline-flex">
        {isEditable ? (
          // Edit mode: show upload button
          <button
            aria-label={displayImage ? "Change image" : "Upload image"}
            className="relative flex size-25 items-center justify-center overflow-hidden rounded-full border border-input border-dashed outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-disabled:pointer-events-none has-[img]:border-none has-disabled:opacity-50 data-[dragging=true]:bg-accent/50"
            data-dragging={isDragging || undefined}
            onClick={(e) => {
              // Prevent opening file input if clicking on remove button
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
              <div aria-hidden="true" className="flex items-center justify-center">
                <CircleUserRoundIcon className="size-8 opacity-60" />
              </div>
            )}
          </button>
        ) : (
          // View mode: show regular Avatar component with fallback
          <Avatar className="w-25 h-25">
            <AvatarImage src={currentAvatar ?? ""} alt={userName} />
            <AvatarFallback className="text-lg bg-primary text-primary-foreground">
              {getInitialName(userName)}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Camera icon indicator - only shows in edit mode */}
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

        {/* Remove button - shows when there's a current avatar or cropped image */}
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

        {/* Hidden file input */}
        {isEditable && (
          <input
            {...getInputProps()}
            aria-label="Upload image file"
            className="sr-only"
            tabIndex={-1}
          />
        )}
      </div>

      {/* Cropper Dialog - Only enabled in edit mode */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
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
                <span>Crop image</span>
              </div>
              <Button
                autoFocus
                className="-my-1"
                disabled={!previewUrl}
                onClick={handleApply}
              >
                Apply
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
