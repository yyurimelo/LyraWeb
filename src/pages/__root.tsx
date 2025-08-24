import type { AuthFormModel } from '@/@types/auth/auth-form-model';
import type { AuthUserDataModel } from '@/@types/auth/auth-user-data-model';
import { HeadContent, Outlet, createRootRouteWithContext } from '@tanstack/react-router';

interface AuthState {
  isAuthenticated: boolean
  user: AuthUserDataModel | null
  login: (credentials: AuthFormModel) => Promise<void>;
  logout: () => void
}

interface MyRouterContext {
  auth: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
