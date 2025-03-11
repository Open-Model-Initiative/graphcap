// SPDX-License-Identifier: Apache-2.0
import { ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useLayoutHeight, useActionPanel } from './hooks'
import styles from './MainLayout.module.css'

interface MainLayoutProps {
  children: ReactNode
  leftSidebar?: ReactNode
  rightSidebar?: ReactNode
  leftActionPanel?: ReactNode
  rightActionPanel?: ReactNode
}

/**
 * Main layout component that provides a consistent structure with header, footer, and optional sidebars
 * 
 * This component handles:
 * - Proper height calculations for the content area
 * - Consistent header and footer placement
 * - Optional left and right sidebars
 * - Optional collapsible action panels on left and right sides
 * 
 * @param children - The main content to display
 * @param leftSidebar - Optional left sidebar content
 * @param rightSidebar - Optional right sidebar content
 * @param leftActionPanel - Optional left action panel content
 * @param rightActionPanel - Optional right action panel content
 */
export function MainLayout({ 
  children, 
  leftSidebar, 
  rightSidebar,
  leftActionPanel,
  rightActionPanel
}: Readonly<MainLayoutProps>) {
  const { 
    containerRef, 
    headerRef, 
    contentRef, 
    footerRef, 
    contentHeight,
    isCalculating 
  } = useLayoutHeight();

  // Always initialize action panel hooks, but only use them if panels are provided
  const leftPanelHook = useActionPanel({ 
    side: 'left',
    collapsedWidth: 40
  });
  
  const rightPanelHook = useActionPanel({ 
    side: 'right',
    expandedWidth: 500,
    collapsedWidth: 40
  });
  
  // Use the hooks conditionally based on whether panels are provided
  const leftPanel = leftActionPanel ? leftPanelHook : null;
  const rightPanel = rightActionPanel ? rightPanelHook : null;
  
  // Track if panels are rendered to avoid layout shifts
  const [panelsReady, setPanelsReady] = useState(false);
  
  // Set panels as ready after initial render
  useEffect(() => {
    setPanelsReady(true);
  }, []);

  // Calculate content padding based on panel states
  const leftPadding = leftPanel?.isExpanded ? leftPanel.width : (leftPanel?.width ?? 0);
  const rightPadding = rightPanel?.isExpanded ? rightPanel.width : (rightPanel?.width ?? 0);

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
        style={{ 
          height: isCalculating ? 'auto' : `${contentHeight}px`,
          paddingLeft: panelsReady && leftPanel ? `${leftPadding}px` : undefined,
          paddingRight: panelsReady && rightPanel ? `${rightPadding}px` : undefined,
          transition: 'padding 0.3s ease-in-out'
        }}
      >
        <div className={styles.contentInner}>
          {children}
        </div>
      </main>
      
      {/* Footer with fixed height */}
      <div ref={footerRef} className={styles.footer}>
        <Footer />
      </div>

      {/* Render action panels */}
      {leftActionPanel && panelsReady && leftActionPanel}
      {rightActionPanel && panelsReady && rightActionPanel}
    </div>
  )
} 