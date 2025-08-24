import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-provider'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({
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
  component: DashboardLayout,
})

function DashboardLayout() {
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

      <div className='flex justify-end w-full'>
        <Button onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </div>
  )

}