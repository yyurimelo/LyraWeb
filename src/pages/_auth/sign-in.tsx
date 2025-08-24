import z from "zod";
import { useId, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputPassword } from "@/components/ui/input-passowrd";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

const signInFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

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
  const { auth } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const id = useId();
  const [isLoading, setIsLoading] = useState(false)

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
      toast.error('Invalid username or password', err)
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
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
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
            {isLoading ? isLoading : "Entrar"}
          </Button>

          <div className="text-center text-sm">
            Não possui uma conta?{" "}
            <Link to="/sign-up" className="underline underline-offset-4">
              Registre-se
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
