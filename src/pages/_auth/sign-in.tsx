import z from "zod";
import { useId, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from '@tanstack/react-router'
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputPassword } from "@/components/ui/input-passowrd";

const signInFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormSchema = z.infer<typeof signInFormSchema>;

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignIn,
  head: () => ({
    meta: [
      {
        title: 'Sign-in | Lyra Chat'
      },
    ],
  }),
})

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const id = useId();

  const form = useForm<SignInFormSchema>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(data: SignInFormSchema) {
    setIsLoading(true)
    console.log(data)
  }


  return (

    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6">
          {/* <div>
                  <GoogleAuthButton />
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Ou continue com
                  </span>
                </div> */}

          {/* form login */}
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
            // disabled={isLoading}
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
