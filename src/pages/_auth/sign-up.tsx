import z from "zod";
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/shared/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { InputPassword } from "@/shared/components/ui/input-passowrd";
import { useCreateUserMutation } from "@/shared/http/hooks/user.hooks";

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUp,
  head: () => ({
    meta: [
      {
        title: 'Sign-up | Lyra Chat'
      },
    ],
  }),
})

export function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const id = useId();

  const signUpForm = z
    .object({
      name: z.string().min(1, t('auth.errors.nameRequired')),
      email: z.string().min(1, t('auth.errors.emailRequired')).email(t('auth.errors.invalidEmail')),
      password: z.string().min(1, t('auth.errors.passwordRequired')),
      confirmPassword: z.string().min(1, t('auth.errors.confirmPasswordRequired')),
    })
    .superRefine((data) => {
      if (data.password !== data.confirmPassword) {
        throw new z.ZodError([
          {
            path: ["confirmPassword"],
            message: t('auth.errors.passwordsMustMatch'),
            code: z.ZodIssueCode.custom,
          },
        ]);
      }
    });

  type SignUpForm = z.infer<typeof signUpForm>;

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpForm),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync: createUserFn, isPending } = useCreateUserMutation()

  async function handleSubmit(data: SignUpForm) {
    await createUserFn({ ...data })
    await navigate({
      to: "/sign-in"
    })
  }

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.username')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('auth.signUp.usernamePlaceholder')} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.email')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('auth.signUp.emailPlaceholder')} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.password')}</FormLabel>
              <FormControl>
                <InputPassword
                  id={id}
                  field={field}
                  error={form.formState.errors.password}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.signUp.confirmPassword')}</FormLabel>
              <FormControl>
                <InputPassword
                  id={id}
                  field={field}
                  error={form.formState.errors.confirmPassword}
                  isNormalInputPassword={true}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          disabled={isPending}
          form={id}
          type="submit"
          className="w-full"
        >
          {isPending && (
            <LoaderCircle className="w-4 h-4 text-primary-foreground animate-spin mr-2" />
          )}
          {isPending ? t('common.loading') : t('auth.signUp.register')}
        </Button>
        <div className="text-center text-sm text-foreground/50">
          {t('auth.signUp.hasAccount').split('?')[0]}{" "}
          <Link to="/sign-in" className="text-foreground hover:underline">
            {t('auth.signUp.hasAccount').split('?')[1]}
          </Link>
        </div>
      </form>
    </Form>
  )
}