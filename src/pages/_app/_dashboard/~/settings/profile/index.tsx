import { createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@/contexts/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitialName } from "@/lib/get-initial-name"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useGetUserQuery } from "@/http/hooks/user.hooks"
import { useEffect, useId, useState } from "react"
import { oklchToHex } from "@/utils/color"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Combo } from "@/components/ui/combo"

import { ClickCopy } from "@/components/ui/click-copy"
import { formatHexInput } from "@/lib/hex-format"
import { abbreviateUserIdentifier } from "@/utils/abbreviate-user-identifier"
import { Separator } from "@/components/ui/separator"
import { Check, LoaderCircle, Pencil, X } from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"

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
  const id = useId();
  const [edit, setEdit] = useState(false);
  const { user } = useAuth()

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

  const { data: userData } = useGetUserQuery(user?.id ?? "")

  useEffect(() => {
    if (user) {
      form.reset({
        name: userData?.name || "",
        description: userData?.description || "",
        appearancePrimaryColor: userData?.appearancePrimaryColor
          ? oklchToHex(userData?.appearancePrimaryColor)
          : "",
        appearanceTextPrimaryLight: userData?.appearanceTextPrimaryLight || null,
        appearanceTextPrimaryDark: userData?.appearanceTextPrimaryDark || null,
      });
    }
  }, [user, form]);

  function handleEdit() {
    setEdit(true);
  }

  function handleCancelEdit() {
    setEdit(false);
    form.reset({
      name: userData?.name || "",
      description: userData?.description || "",
      appearancePrimaryColor: userData?.appearancePrimaryColor
        ? oklchToHex(userData.appearancePrimaryColor)
        : "",
      appearanceTextPrimaryLight: userData?.appearanceTextPrimaryLight || null,
      appearanceTextPrimaryDark: userData?.appearanceTextPrimaryDark || null,
    });
  }

  const isPending = false;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and preferences
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user?.avatarUser} alt={user?.name} />
          <AvatarFallback className="text-lg">
            {getInitialName(user?.name)}
          </AvatarFallback>
        </Avatar>
      </div>

      <Form {...form}>
        <form
          id={id}
          // onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <header className="w-full flex items-center justify-end">
            {!edit && (
              <Button variant="ghost" type="button" onClick={handleEdit}>
                <Pencil className="w-4 h-4" />
                Editar
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
                      Atualizando
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirmar
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
                    Cancelar
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
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      {...field}
                      disabled={!edit}
                      placeholder={!edit ? "Não informado" : ""}
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={!edit}
                      placeholder={!edit ? "Não informada" : ""}
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
                    <FormLabel>Cor da fonte</FormLabel>
                    <FormDescription>Tema claro</FormDescription>
                  </div>
                  <FormControl>
                    <Combo
                      className="w-full"
                      value={field.value}
                      onSelect={(selectedValue) => {
                        form.setValue("appearanceTextPrimaryLight", "");
                        field.onChange(selectedValue);
                      }}
                      itens={[
                        {
                          label: "Branco",
                          value: "oklch(1.000 0.000 89.876)",
                        },
                        { label: "Preto", value: "oklch(0.000 0.000 0.000)" },
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
                    <FormLabel>Cor da fonte</FormLabel>
                    <FormDescription>Tema escuro</FormDescription>
                  </div>
                  <FormControl>
                    <Combo
                      className="w-full"
                      value={field.value}
                      onSelect={(selectedValue) => {
                        form.setValue("appearanceTextPrimaryDark", "");
                        field.onChange(selectedValue);
                      }}
                      itens={[
                        {
                          label: "Branco",
                          value: "oklch(1.000 0.000 89.876)",
                        },
                        { label: "Preto", value: "oklch(0.000 0.000 0.000)" },
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
                    <FormLabel>Cor primária</FormLabel>
                    <FormDescription>Valor</FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex gap-3 w-full">
                      <Input
                        className=" w-full"
                        placeholder="Informe o hexadecimal"
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