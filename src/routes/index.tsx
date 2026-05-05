import { createFileRoute, redirect } from '@tanstack/react-router'
import { HermesWorldLanding } from '@/screens/playground/hermes-world-landing'

function isHermesWorldPublicHost() {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'hermes-world.ai' || host === 'www.hermes-world.ai'
}

export const Route = createFileRoute('/')({
  ssr: false,
  beforeLoad: function routeRoot() {
    if (isHermesWorldPublicHost()) return
    throw redirect({
      to: '/chat' as string,
      replace: true,
    })
  },
  component: function IndexRoute() {
    return <HermesWorldLanding />
  },
})
