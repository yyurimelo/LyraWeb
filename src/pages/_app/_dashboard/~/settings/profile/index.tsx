import { createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@/contexts/auth-provider"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUpdateUserProfileMutation, useUploadAvatarMutation } from "@/shared/http/hooks/user.hooks"
import { useEffect, useId, useState, useCallback } from "react"
import { oklchToHex, hexToOKLCH } from "@/shared/utils/color"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Combo } from "@/shared/components/ui/combo"

import { ClickCopy } from "@/shared/components/ui/click-copy"
import { formatHexInput } from "@/lib/hex-format"
import { abbreviateUserIdentifier } from "@/shared/utils/abbreviate-user-identifier"
import { Separator } from "@/shared/components/ui/separator"
import { Check, LoaderCircle, Pencil, X } from "lucide-react"
import { ColorPicker } from "@/shared/components/ui/color-picker"
import { useTranslation } from "react-i18next"
import { ProfileAvatarEditor } from "@/pages/_app/_dashboard/-components/profile-avatar-editor"

export const Route = createFileRoute('/_app/_dashboard/~/settings/profile/')({
  component: Profile,
})

const profileFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  appearancePrimaryColor: z.string().optional(),
  appearanceTextPrimaryLight: z.string().nullable().optional(),
  appearanceTextPrimaryDark: z.string().nullable().optional(),
});

type ProfileFormSchema = z.infer<typeof profileFormSchema>;

function Profile() {
  const { t } = useTranslation();
  const id = useId();
  const [edit, setEdit] = useState(false);
  const { user, updateUser } = useAuth()

  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      description: "",
      appearancePrimaryColor: "",
      appearanceTextPrimaryDark: "",
      appearanceTextPrimaryLight: "",
    },
  });

  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);

  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false);

  const handleAvatarChange = useCallback((blob: Blob | null) => {
    if (blob) {
      setShouldRemoveAvatar(false);
    }
    setAvatarBlob(blob);
  }, []);

  const updateUserMutation = useUpdateUserProfileMutation(
    setEdit,
    updateUser,
  );

  const uploadAvatarMutation = useUploadAvatarMutation(updateUser);

  const resetFormToUserData = useCallback(() => {
    if (!user) return;

    form.reset({
      name: user.name || "",
      description: user.description || "",
      appearancePrimaryColor: user.appearancePrimaryColor
        ? oklchToHex(user.appearancePrimaryColor)
        : "",
      appearanceTextPrimaryLight: user.appearanceTextPrimaryLight || null,
      appearanceTextPrimaryDark: user.appearanceTextPrimaryDark || null,
    });
  }, [user, form]);

  useEffect(() => {
    resetFormToUserData();
  }, [resetFormToUserData]);

  function handleEdit() {
    setEdit(true);
  }

  function handleCancelEdit() {
    setEdit(false);
    setAvatarBlob(null);
    setShouldRemoveAvatar(false);
    resetFormToUserData();
  }

  const isPending = updateUserMutation.isPending || uploadAvatarMutation.isPending;

  async function handleSubmit(data: ProfileFormSchema) {
    if (updateUserMutation.isPending) return;

    const updateData: {
      name: string;
      description?: string;
      appearancePrimaryColor?: string | null;
      appearanceTextPrimaryLight?: string;
      appearanceTextPrimaryDark?: string;
      avatar?: File;
      removeAvatar?: boolean;
    } = {
      name: data.name,
      description: data.description || undefined,
      appearancePrimaryColor: data.appearancePrimaryColor
        ? hexToOKLCH(data.appearancePrimaryColor)
        : null,
      appearanceTextPrimaryLight: data.appearanceTextPrimaryLight || undefined,
      appearanceTextPrimaryDark: data.appearanceTextPrimaryDark || undefined,
      removeAvatar: shouldRemoveAvatar,
    };

    if (avatarBlob) {
      updateData.avatar = new File([avatarBlob], "avatar.jpg", {
        type: avatarBlob.type,
        lastModified: Date.now(),
      });
    } else if (shouldRemoveAvatar) {
      updateData.removeAvatar = true;
    }

    await updateUserMutation.mutateAsync(updateData);
    setAvatarBlob(null);
    setShouldRemoveAvatar(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('settings.profile.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('settings.profile.subtitle')}
        </p>
      </div>

      <ProfileAvatarEditor
        currentAvatar={user?.avatarUser}
        userName={user?.name || ""}
        isEditable={edit}
        isAvatarRemoved={shouldRemoveAvatar}
        onAvatarChange={handleAvatarChange}
        onAvatarRemove={() => setShouldRemoveAvatar(true)}
      />

      <Form {...form}>
        <form
          id={id}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <header className="w-full flex items-center justify-end">
            {!edit && (
              <Button variant="ghost" type="button" onClick={handleEdit}>
                <Pencil className="w-4 h-4" />
                {t('settings.profile.edit')}
              </Button>
            )}

            {edit && (
              <>
                <Button
                  form={id}
                  variant="ghost"
                  className="text-emerald-500 hover:text-emerald-500"
                  type="submit"
                // disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      {t('settings.profile.updating')}
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('settings.profile.confirm')}
                    </>
                  )}
                </Button>

                {!isPending && (
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-500"
                    onClick={handleCancelEdit}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                    {t('settings.profile.cancel')}
                  </Button>
                )}
              </>
            )}
          </header>

          <Separator className="my-4" />

          <section className=" space-y-2">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center gap-2">
                ID:{" "}
                {abbreviateUserIdentifier(
                  user?.userIdentifier || ""
                )}
                <ClickCopy
                  content={abbreviateUserIdentifier(
                    user?.userIdentifier || ""
                  )}
                  variant={"ghost"}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.name')}</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      {...field}
                      disabled={!edit}
                      placeholder={!edit ? t('settings.profile.namePlaceholder') : ""}
                      autoComplete="name"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={!edit}
                      placeholder={!edit ? t('settings.profile.descriptionPlaceholder') : ""}
                      autoComplete="description"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <Separator className="my-6" />

          <section className="grid lg:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="appearanceTextPrimaryLight"
              render={({ field }) => (
                <FormItem>
                  <div>
                    <FormLabel>{t('settings.profile.fontColor')}</FormLabel>
                    <FormDescription>{t('settings.profile.themeWhite')}</FormDescription>
                  </div>
                  <FormControl>
                    <Combo
                      className="w-full"
                      value={field.value}
                      onSelect={(selectedValue) => {
                        field.onChange(selectedValue);
                      }}
                      itens={[
                        {
                          label: t('settings.profile.white'),
                          value: "oklch(1.000 0.000 89.876)",
                        },
                        { label: t('settings.profile.black'), value: "oklch(0.000 0.000 0.000)" },
                      ]}
                      disabled={!edit}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearanceTextPrimaryDark"
              render={({ field }) => (
                <FormItem>
                  <div>
                    <FormLabel>{t('settings.profile.fontColor')}</FormLabel>
                    <FormDescription>{t('settings.profile.themeDark')}</FormDescription>
                  </div>
                  <FormControl>
                    <Combo
                      className="w-full"
                      value={field.value}
                      onSelect={(selectedValue) => {
                        field.onChange(selectedValue);
                      }}
                      itens={[
                        {
                          label: t('settings.profile.white'),
                          value: "oklch(1.000 0.000 89.876)",
                        },
                        { label: t('settings.profile.black'), value: "oklch(0.000 0.000 0.000)" },
                      ]}
                      disabled={!edit}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appearancePrimaryColor"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div>
                    <FormLabel>{t('settings.profile.primaryColor')}</FormLabel>
                    <FormDescription>{t('settings.profile.hexValue')}</FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex gap-3 w-full">
                      <Input
                        className="w-full"
                        placeholder={t('settings.profile.hexPlaceholder')}
                        type="text"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatHexInput(e.target.value);
                          field.onChange(formatted);
                        }}
                        disabled={!edit}
                      />

                      <ColorPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={!edit}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </section>
        </form>
      </Form>

    </div>
  )
}