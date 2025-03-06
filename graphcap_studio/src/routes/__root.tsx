import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MainLayout } from '../common/components/layout'

export const Route = createRootRoute({
  component: () => (
    <MainLayout
    >
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </MainLayout>
  ),
}) 