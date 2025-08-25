import { Link, linkOptions } from "@tanstack/react-router"

export const options = linkOptions([
  {
    to: '/',
    label: 'Dashboard',
    activeOptions: { exact: true },
  },
  {
    to: '/~/settings',
    label: 'Settings',
  },
])

export function HeaderNavigation() {
  return (
    <>
      <div className="flex items-center space-x-2 lg:space-x-3">
        {options.map((option) => {
          return (
            <Link
              {...option}
              key={option.to}
              activeProps={{
                className: "text-secondary-foreground after:w-full",
              }}
              className=""
            >
              {option.label}
            </Link>
          )
        })}
      </div>
    </>
  )
}