import z from "zod";
import { useId, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { InputPassword } from "@/shared/components/ui/input-passowrd";
import { toast } from "sonner";
import { ArrowRight, LoaderCircle } from "lucide-react";

const fallback = '/' as const

export const Route = createFileRoute('/_auth/sign-in')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: SignIn,
  head: () => ({
    meta: [
      {
        title: 'Sign-in | Lyra Chat'
      },
    ],
  }),
})

function SignIn() {
  const { t } = useTranslation();
  const { auth } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const id = useId();
  const [isLoading, setIsLoading] = useState(false)

  const signInFormSchema = z.object({
    email: z.string().min(1, t('auth.errors.emailRequired')).email(t('auth.errors.invalidEmail')),
    password: z.string().min(1, t('auth.errors.passwordRequired')),
  });

  type SignInFormSchema = z.infer<typeof signInFormSchema>;

  const form = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(data: SignInFormSchema) {
    setIsLoading(true)

    try {
      await auth.login({ ...data })
      await navigate({ to: search.redirect || fallback })
    } catch (err: any) {
      toast.error(t('auth.errors.invalidCredentials'), err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.signIn.email')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('auth.signIn.emailPlaceholder')} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.signIn.password')}</FormLabel>
                <FormControl>
                  <InputPassword
                    id={id}
                    field={field}
                    error={form.formState.errors.password}
                    isNormalInputPassword={true}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            disabled={isLoading}
            form={id}
            type="submit"
            className="w-full"
          >
            {isLoading && (
              <LoaderCircle className="w-4 h-4 text-primary-foreground animate-spin mr-2" />
            )}
            {isLoading ? t('common.loading') : t('auth.signIn.continue')}

            {!isLoading && (
              <ArrowRight className="h-4 w-4" />
            )}

          </Button>

          <div className="text-center text-sm text-foreground/50">
            {t('auth.signIn.noAccount').split('?')[0]}{" "}
            <Link to="/sign-up" className="text-foreground hover:underline">
              {t('auth.signIn.noAccount').split('?')[1]}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}