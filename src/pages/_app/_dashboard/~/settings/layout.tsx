import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { User, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/_dashboard/~/settings')({
  component: SettingsLayout,
  head: () => ({
    meta: [
      {
        title: 'Settings | Lyra Chat'
      },
    ],
  }),
})

interface TabButtonProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function TabButton({ to, icon: Icon, children }: TabButtonProps) {

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-sm",
        "hover:bg-accent/30 hover:text-accent-foreground",
        "bg-background/80"
      )}
      activeProps={{
        className: "bg-muted/50"
      }}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </Link>
  )
}

function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
      <div className='flex flex-col space-y-1 mb-6'>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className='text-muted-foreground'>
          {t('settings.description')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tabs Navigation */}
        <nav className="flex flex-row lg:flex-col lg:w-64 lg:shrink-0 overflow-x-auto lg:overflow-x-visible">
          <div className='border rounded-md p-2 space-y-1 w-full'>
            <TabButton to="/~/settings/profile" icon={User}>
              {t('settings.profile.titleTab')}
            </TabButton>
            <TabButton to="/~/settings/requests" icon={MessageSquare}>
              {t('settings.requests.titleTab')}
            </TabButton>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 min-w-0 border rounded-md p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
