import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_dashboard/~/settings/requests/')({
  component: Requests,
})

function Requests() {
  return (
    "requests"
  )
}