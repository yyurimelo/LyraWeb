import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_dashboard/~/settings/')({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: 'Settings | Lyra Chat'
      },
    ],
  }),
})

function RouteComponent() {
  return <div>Hello "/_app/_dashboard/~settings/"!</div>
}
