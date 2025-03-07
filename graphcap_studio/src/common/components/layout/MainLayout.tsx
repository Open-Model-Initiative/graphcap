import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface MainLayoutProps {
  children: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
}

export function MainLayout({ children, leftSidebar, rightSidebar }: MainLayoutProps) {
  // Calculate content padding based on visible sidebars
  const contentClasses = `
    flex-1 overflow-hidden
    ${leftSidebar ? 'pl-64' : ''}
    ${rightSidebar ? 'pr-64' : ''}
  `

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Header with fixed height */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Main content area that takes remaining space */}
      <main className={contentClasses}>
        <div className="h-full">
          {children}
        </div>
      </main>
      
      {/* Footer with fixed height */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  )
} 