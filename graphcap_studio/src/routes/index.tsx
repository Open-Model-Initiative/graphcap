import { createFileRoute, Link } from '@tanstack/react-router'
import { useFeatureFlags } from '../common/providers'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { featureFlags, toggleFeatureFlag } = useFeatureFlags();
  
  return (
    <div className="p-2 text-white">
      <h3 className="text-xl font-bold mb-4">Welcome to graphcap Studio!</h3>
      <p className="mb-4">Dashboard currently under construction. Please go to the Gallery to view the available datasets.</p>
      <div className="mb-6">
        <Link 
          to="/gallery/os_img"
          className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          Go to Gallery
        </Link>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-md mb-6">
        <h4 className="text-lg font-semibold mb-2">Developer Settings</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reactQueryDevTools"
              checked={featureFlags.enableReactQueryDevTools}
              onChange={() => toggleFeatureFlag('enableReactQueryDevTools')}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="reactQueryDevTools" className="text-sm">
              Enable React Query DevTools
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="routerDevTools"
              checked={featureFlags.enableRouterDevTools}
              onChange={() => toggleFeatureFlag('enableRouterDevTools')}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="routerDevTools" className="text-sm">
              Enable Router DevTools
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
