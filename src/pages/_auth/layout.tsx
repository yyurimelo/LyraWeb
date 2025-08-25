import { LyraChatIcon } from '@/components/logos/lyra-chat-icon'
import { ModeToggle } from '@/components/ui/modo-toggle'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { GoogleAuthButton } from './-components/google-auth/page'
import { useLocation } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

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

          <div>
            <div className="text-center">
              <div className="text-xl">
                {location.pathname === '/sign-in'
                  ? <span className='font-medium'>Sign in to Lyra</span>
                  : <span className='font-medium'>Sign up to Lyra</span>
                }
              </div>

              <p className='text-muted-foreground'>Your chat with your friends</p>

              <div className='space-y-6 mt-5'>
                <div>
                  <GoogleAuthButton />
                </div>
              </div>
              <Separator orientation='horizontal' className='my-4' />
            </div>
            <div>
              <Outlet />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
