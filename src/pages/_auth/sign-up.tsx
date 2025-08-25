import z from "zod";
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-passowrd";
import { useCreateUserMutation } from "@/http/hooks/user.hooks";

const signUpForm = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .superRefine((data) => {
    if (data.password !== data.confirmPassword) {
      throw new z.ZodError([
        {
          path: ["confirmPassword"],
          message: "Passwords must match",
          code: z.ZodIssueCode.custom,
        },
      ]);
    }
  });

type SignUpForm = z.infer<typeof signUpForm>;

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUp,
})

export function SignUp() {
  const navigate = useNavigate()
  const id = useId();

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
              <FormLabel>Nome de usuário</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

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
              <FormLabel>Confirmar senha</FormLabel>
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
          {isPending ? isPending : "Cadastrar"}
        </Button>
        <div className="text-center text-sm">
          Já tem uma conta?{" "}
          <Link to="/sign-in" className="underline underline-offset-4">
            Entrar
          </Link>
        </div>
      </form>
    </Form>
  )
}
