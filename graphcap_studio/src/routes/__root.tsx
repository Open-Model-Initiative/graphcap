import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MainLayout } from '../common/components/layout'

export const Route = createRootRoute({
  component: () => (
    <MainLayout
      leftSidebar={
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Navigation</h3>
          {/* Add left sidebar content */}
        </div>
      }
      rightSidebar={
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Properties</h3>
          {/* Add right sidebar content */}
        </div>
      }
    >
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </MainLayout>
  ),
}) 