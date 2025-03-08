// SPDX-License-Identifier: Apache-2.0
import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useLayoutHeight } from './hooks'
import styles from './MainLayout.module.css'

interface MainLayoutProps {
  children: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
}

/**
 * Main layout component that provides a consistent structure with header, footer, and optional sidebars
 * 
 * This component handles:
 * - Proper height calculations for the content area
 * - Consistent header and footer placement
 * - Optional left and right sidebars
 * 
 * @param children - The main content to display
 * @param leftSidebar - Optional left sidebar content
 * @param rightSidebar - Optional right sidebar content
 */
export function MainLayout({ children, leftSidebar, rightSidebar }: Readonly<MainLayoutProps>) {
  const { 
    containerRef, 
    headerRef, 
    contentRef, 
    footerRef, 
    contentHeight,
    isCalculating 
  } = useLayoutHeight();

  // Determine content classes based on sidebar presence
  const contentClasses = `
    ${styles.content}
    ${leftSidebar ? styles.contentWithLeftSidebar : ''}
    ${rightSidebar ? styles.contentWithRightSidebar : ''}
  `;

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Header with fixed height */}
      <div ref={headerRef} className={styles.header}>
        <Header />
      </div>

      {/* Main content area that takes remaining space */}
      <main 
        ref={contentRef} 
        className={contentClasses}
        style={{ height: isCalculating ? 'auto' : `${contentHeight}px` }}
      >
        <div className={styles.contentInner}>
          {children}
        </div>
      </main>
      
      {/* Footer with fixed height */}
      <div ref={footerRef} className={styles.footer}>
        <Footer />
      </div>
    </div>
  )
} 