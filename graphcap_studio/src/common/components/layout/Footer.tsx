export function Footer() {
  return (
    <footer className="h-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {new Date().getFullYear()} graphcap Studio - alpha client
        </div>
        <div className="flex space-x-3">
          <a 
            href="https://github.com/fearnworks/graphcap" 
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a 
            href="https://fearnworks.github.io/graphcap/" 
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  )
} 