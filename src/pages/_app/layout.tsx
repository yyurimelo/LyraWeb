import { Header } from '@/components/header'
import { useAuth } from '@/contexts/auth-provider'
import { createFileRoute, Navigate, Outlet, redirect } from '@tanstack/react-router'

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
  const { user } = useAuth()

  if (user === null) {
    return <Navigate to='/sign-in' replace />
  }


return (
  <div className="flex flex-col h-dvh">
    <Header />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
)


}