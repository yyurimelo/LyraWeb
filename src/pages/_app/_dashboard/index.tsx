import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Index</div>
}
