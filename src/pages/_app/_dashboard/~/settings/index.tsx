import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_app/_dashboard/~/settings/')({
  component: SettingsIndex,
})

function SettingsIndex() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/~/settings/profile' })
  }, [navigate])

  return null
}