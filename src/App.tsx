import { QueryClientProvider, queryClient } from "@lyra/react-query-config"
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from './components/ui/theme-provider';
import { createHttp } from "@lyra/axios-config";
import { env } from './env';
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/auth-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const router = createRouter({
  routeTree, context: {
    auth: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createHttp(env.VITE_API_URL)

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <InnerApp />
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
