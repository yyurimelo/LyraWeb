import { QueryClientProvider, queryClient } from "@lyra/react-query-config"
import { routeTree } from './routeTree.gen';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { ThemeProvider } from './components/ui/theme-provider';
import { createHttp } from "@lyra/axios-config";
import { env } from './env';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth-provider";

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createHttp(env.VITE_API_URL)

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />

        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
