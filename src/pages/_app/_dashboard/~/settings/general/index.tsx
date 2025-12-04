import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute('/_app/_dashboard/~/settings/general/')({
  component: General,
})

function General() {
  return (
    "general"
  )
}