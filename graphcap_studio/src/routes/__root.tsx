import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MainLayout, ActionPanel } from '../common/components/layout'
import { useFeatureFlag } from '../common/providers'
import { FeatureFlagsPanel } from '../common/components/feature-flags'
import { ServerConnectionsPanel } from '../common/components/server-connections'
import { FileBrowserPanel } from '../common/components/file-browser'
import { ProvidersPanel } from '../features/inference/providers'
import { FlagIcon, ServerIcon, FolderIcon, SettingsIcon, ProviderIcon } from '../common/components/icons'

/**
 * RouterDevTools component that conditionally renders based on feature flag
 */
function RouterDevTools() {
  const showRouterDevTools = useFeatureFlag('enableRouterDevTools');
  
  return showRouterDevTools ? <TanStackRouterDevtools /> : null;
}

/**
 * Left action panel with multiple sections
 */
function LeftActionPanel() {
  return (
    <ActionPanel 
      side="left" 
      defaultExpanded={false}
      expandedWidth={350}
      sections={[
        {
          id: 'feature-flags',
          title: 'Feature Flags',
          icon: <FlagIcon />,
          content: <FeatureFlagsPanel />
        },
        {
          id: 'providers',
          title: 'Providers',
          icon: <ProviderIcon />,
          content: <ProvidersPanel />
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: <SettingsIcon />,
          content: <div className="p-4">Settings panel content will go here</div>
        }
      ]}
    />
  );
}

/**
 * Right action panel with multiple sections
 */
function RightActionPanel() {
  return (
    <ActionPanel 
      side="right"
      defaultExpanded={false}
      expandedWidth={350}
      sections={[
        {
          id: 'server-connections',
          title: 'Server Connections',
          icon: <ServerIcon />,
          content: <ServerConnectionsPanel />
        },
        {
          id: 'file-browser',
          title: 'File Browser',
          icon: <FolderIcon />,
          content: <FileBrowserPanel />
        }
      ]}
    />
  );
}

export const Route = createRootRoute({
  component: () => (
    <MainLayout 
      leftActionPanel={<LeftActionPanel />}
      rightActionPanel={<RightActionPanel />}
    >
      <Outlet />
      <RouterDevTools />
    </MainLayout>
  ),
}) 