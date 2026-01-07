import { useCallback, useState } from "react";
import { updateUser } from "@/shared/http/services/user.service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useAvatarUpload() {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadAvatar = useCallback(
    async (blob: Blob, fileName: string = "avatar.jpg"): Promise<string> => {
      setIsUploading(true);
      setError(null);

      try {
        // Convert blob to File
        const file = new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        });

        // Upload to backend
        const response = await updateUser({ avatar: file });

        return response.avatarUser;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(t("toasts.user.updateProfileError"));
        setError(error);
        toast.error(error.message);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [t]
  );

  return {
    uploadAvatar,
    isUploading,
    error,
  };
}
