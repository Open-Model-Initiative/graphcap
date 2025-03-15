import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MainLayout, ActionPanel } from '@/app/layout'
import { useFeatureFlag } from '@/context'
import { FeatureFlagsPanel } from '@/features/app-settings/feature-flags'
import { ServerConnectionsPanel } from '@/features/server-connections/components'
import { FileBrowserPanel } from '@/common/components/file-browser'
import { ProvidersPanel } from '@/features/inference/providers'
import { SettingsPanel } from '@/features/app-settings'
import { DatasetPanel } from '@/features/datasets'
import { FlagIcon, ServerIcon, FolderIcon, SettingsIcon, ProviderIcon, DatasetIcon } from '@/components/icons'

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
          id: 'datasets',
          title: 'Datasets',
          icon: <DatasetIcon />,
          content: <DatasetPanel />
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
          content: <SettingsPanel />
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