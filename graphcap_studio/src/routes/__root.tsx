import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MainLayout, RootLeftActionPanel, RootRightActionPanel } from '@/app/layout'
import { useFeatureFlag } from '@/context'

/**
 * RouterDevTools component that conditionally renders based on feature flag
 */
function RouterDevTools() {
  const showRouterDevTools = useFeatureFlag('enableRouterDevTools');
  
  return showRouterDevTools ? <TanStackRouterDevtools /> : null;
}

export const Route = createRootRoute({
  component: () => (
      <MainLayout 
        leftActionPanel={<RootLeftActionPanel />}
        rightActionPanel={<RootRightActionPanel />}
      >
        <Outlet />
        <RouterDevTools />
      </MainLayout>
  ),
}) 