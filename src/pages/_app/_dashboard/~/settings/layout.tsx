import { createFileRoute, Link, linkOptions, Outlet } from '@tanstack/react-router'

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

const options = linkOptions([
  {
    to: '/~/settings/general',
    label: 'General',
    activeOptions: { exact: true },
  },
  {
    to: '/~/settings/requests',
    label: 'Requests',
  },
])

function SettingsLayout() {
  return (
    <>
      <div className="flex items-center border-b">
        <h2 className="text-xl p-2">Settings</h2>
      </div>

      <div className="flex flex-wrap divide-x">
        {options.map((option) => {
          return (
            <Link
              {...option}
              key={option.to}
              activeProps={{ className: `font-bold` }}
              className="p-2"
            >
              {option.label}
            </Link>
          )
        })}
      </div>
      <hr />

      <Outlet />
    </>
  )
}
