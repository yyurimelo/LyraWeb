import { LyraChatIcon } from '@/components/logos/lyra-chat-icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModeToggle } from '@/components/ui/modo-toggle'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { GoogleAuthButton } from './-components/google-auth/page'
import { useLocation } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

export default function AuthLayout() {
  const location = useLocation();

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ModeToggle />
      </div>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col space-y-4">
          <div className="flex items-center justify-center">
            <LyraChatIcon height="h-10" />
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {location.pathname === '/sign-in'
                  ? <span>Bem-vindo ao Lyra</span>
                  : <span>Cadastre-se no Lyra</span>
                }
              </CardTitle>
              <CardDescription>Acesse rapidamente com Google</CardDescription>
              <div className='space-y-6 mt-5'>
                <div>
                  <GoogleAuthButton />
                </div>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Ou continue com
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
