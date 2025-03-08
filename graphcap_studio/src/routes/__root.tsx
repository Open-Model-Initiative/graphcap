import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MainLayout } from '../common/components/layout'
import { useFeatureFlag } from '../common/providers'

/**
 * RouterDevTools component that conditionally renders based on feature flag
 */
function RouterDevTools() {
  const showRouterDevTools = useFeatureFlag('enableRouterDevTools');
  
  return showRouterDevTools ? <TanStackRouterDevtools /> : null;
}

export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
      <RouterDevTools />
    </MainLayout>
  ),
}) 