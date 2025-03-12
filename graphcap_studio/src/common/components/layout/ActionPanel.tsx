// SPDX-License-Identifier: Apache-2.0
import { ReactNode, useState, useCallback } from 'react';
import { useActionPanel } from './hooks';
import styles from './ActionPanel.module.css';

/**
 * Action panel section configuration
 */
export interface ActionPanelSection {
  /**
   * Unique identifier for the section
   */
  id: string;
  
  /**
   * Display title for the section
   */
  title: string;
  
  /**
   * Icon to display in collapsed mode (can be a string or ReactNode)
   */
  icon: ReactNode;
  
  /**
   * Content to display when the section is active
   */
  content: ReactNode;
}

/**
 * Props for the ActionPanel component
 */
interface ActionPanelProps {
  /**
   * The side of the panel ('left' or 'right')
   */
  side: 'left' | 'right';
  
  /**
   * Default expanded state
   */
  defaultExpanded?: boolean;
  
  /**
   * Width of the panel when expanded (in pixels)
   */
  expandedWidth?: number;
  
  /**
   * Width of the panel when collapsed (in pixels)
   */
  collapsedWidth?: number;
  
  /**
   * Sections to display in the panel
   */
  sections: ActionPanelSection[];
  
  /**
   * Default active section ID
   */
  defaultActiveSection?: string;
}

/**
 * A collapsible action panel component for the left or right side of the layout
 * 
 * This component provides:
 * - Collapsible panel with chevron toggle button (only visible when expanded)
 * - Icon-based navigation in collapsed mode
 * - Multiple sections with contextual content
 * - Persistent expanded/collapsed state
 * - Smooth transition animations
 * - Responsive layout integration
 * 
 * @param props - Component props
 */
export function ActionPanel({
  side,
  defaultExpanded = false,
  expandedWidth = 256,
  collapsedWidth = 40,
  sections,
  defaultActiveSection
}: Readonly<ActionPanelProps>) {
  const { isExpanded, width, togglePanel, expandPanel } = useActionPanel({
    side,
    defaultExpanded,
    expandedWidth,
    collapsedWidth
  });
  
  // Track the active section
  const [activeSection, setActiveSection] = useState<string>(
    defaultActiveSection ?? (sections.length > 0 ? sections[0].id : '')
  );
  
  // Memoize the section change handler to prevent unnecessary re-renders
  const handleSectionChange = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);
  
  // Find the current active section
  const currentSection = sections.find(section => section.id === activeSection);
  
  // Determine position classes based on side
  const panelClasses = `
    ${styles.panel}
    ${side === 'left' ? styles.leftPanel : styles.rightPanel}
  `;
  
  // Toggle button classes based on side
  const toggleClasses = `
    ${styles.toggleButton}
    ${side === 'left' ? styles.leftToggle : styles.rightToggle}
  `;
  
  // Icon for toggle button based on side and expanded state
  const toggleIcon = side === 'left' ? '◀' : '▶';
  
  return (
    <div 
      className={panelClasses}
      style={{ width: `${width}px` }}
    >
      {/* Toggle button - only show when expanded */}
      {isExpanded && (
        <button
          onClick={togglePanel}
          className={toggleClasses}
          aria-label={`Collapse ${side} panel`}
        >
          {toggleIcon}
        </button>
      )}
      
      {/* Panel content */}
      <div className={styles.panelContent}>
        {/* Icon navigation in collapsed mode */}
        {!isExpanded && (
          <div className={styles.iconNav}>
            {sections.map(section => (
              <button
                key={section.id}
                className={`${styles.iconButton} ${activeSection === section.id ? styles.activeIcon : ''}`}
                onClick={() => {
                  handleSectionChange(section.id);
                  expandPanel(); // Expand the panel when clicking an icon
                }}
                aria-label={section.title}
                title={section.title}
              >
                {section.icon}
              </button>
            ))}
          </div>
        )}
        
        {/* Expanded panel content */}
        {isExpanded && (
          <>
            {/* Section tabs */}
            <div className={styles.sectionTabs}>
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`${styles.sectionTab} ${activeSection === section.id ? styles.activeTab : ''}`}
                  onClick={() => handleSectionChange(section.id)}
                >
                  <span className={styles.sectionIcon}>{section.icon}</span>
                  <span className={styles.sectionTitle}>{section.title}</span>
                </button>
              ))}
            </div>
            
            {/* Active section content */}
            {currentSection && (
              <div className={styles.sectionContent}>
                <div className={styles.sectionBody}>
                  {currentSection.content}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 