import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-provider'
import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

export function AuthenticatedLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    auth.logout()
    navigate({
      to: "/sign-in"
    })
  }


  const auth = useAuth()

  return (
    <div>
      <p>
        Olá {auth.user?.name}
      </p>
      <p>
        Você está na dashboard e está logado
      </p>

      <Outlet />

      <div className='flex justify-end w-full'>
        <Button onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  )

}