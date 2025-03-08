import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2 text-white">
      <h3>Welcome to graphcap Studio!</h3>
      <Link 
            to="/gallery/os_img" 
            className="px-2 py-1 rounded-md text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Go to Default Gallery
          </Link>
    </div>
  )
}
