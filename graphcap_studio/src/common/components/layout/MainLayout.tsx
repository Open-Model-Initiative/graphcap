import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
}

export function MainLayout({ children, leftSidebar, rightSidebar }: MainLayoutProps) {
  // Calculate content padding based on visible sidebars
  const contentClasses = `
    min-h-screen pt-14 pb-12
    ${leftSidebar ? 'pl-64' : ''}
    ${rightSidebar ? 'pr-64' : ''}
  `

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      {leftSidebar && <Sidebar side="left">{leftSidebar}</Sidebar>}
      {rightSidebar && <Sidebar side="right">{rightSidebar}</Sidebar>}
      
      <main className={contentClasses}>
        <div className="h-full p-6">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 