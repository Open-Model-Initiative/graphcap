import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2 text-white">
      <h3 className="text-xl font-bold mb-4 text-white">Welcome to graphcap Studio!</h3>
      <p className="mb-4 text-gray-200">Dashboard currently under construction. Please go to the Gallery to view the available datasets.</p>
      <div className="mb-6">
        <Link 
          to="/gallery"
          className="px-3 py-2 rounded-md text-sm bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          Go to Gallery
        </Link>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-md mb-6">
        <h4 className="text-lg font-semibold mb-2 text-white">Getting Started</h4>
        <p className="text-sm mb-2 text-gray-200">
          Use the side panels to access various tools and settings:
        </p>
        <ul className="text-sm list-disc pl-5 space-y-1 mb-2 text-gray-200">
          <li>Left panel: Feature flags and application settings</li>
          <li>Right panel: Server connections and file browser</li>
        </ul>
        <p className="text-sm text-gray-200">
          Click the toggle buttons on the edges of the screen to expand or collapse the panels.
        </p>
      </div>
    </div>
  )
}
