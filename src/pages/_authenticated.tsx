import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from './_app/layout'

export const Route = createFileRoute('/_authenticated')({
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
  component: () => <AuthenticatedLayout />,
})