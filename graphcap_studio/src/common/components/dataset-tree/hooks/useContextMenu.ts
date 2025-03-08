"use client"

// SPDX-License-Identifier: Apache-2.0
import { useState, useRef, useEffect } from "react"

/**
 * Custom hook for managing context menu state.
 * 
 * @returns {Object} The context menu state and handlers.
 * @property {boolean} isOpen - Whether the context menu is open.
 * @property {React.RefObject<HTMLDivElement>} ref - Ref to attach to the menu container.
 * @property {() => void} open - Function to open the menu.
 * @property {() => void} close - Function to close the menu.
 * @property {() => void} toggle - Function to toggle the menu state.
 */
export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)
  
  // Close the menu when clicking outside
  useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close()
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])
  
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }
    }
    
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])
  
  // Close when mouse leaves the menu
  useEffect(() => {
    if (!isOpen || !ref.current) return
    
    let hoverTimeout: NodeJS.Timeout | null = null
    
    const handleMouseLeave = () => {
      // Add a small delay before closing to prevent accidental closures
      hoverTimeout = setTimeout(() => {
        close()
      }, 300)
    }
    
    const handleMouseEnter = () => {
      // Clear the timeout if the user moves the mouse back into the menu
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        hoverTimeout = null
      }
    }
    
    const menuElement = ref.current
    menuElement.addEventListener("mouseleave", handleMouseLeave)
    menuElement.addEventListener("mouseenter", handleMouseEnter)
    
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
      if (menuElement) {
        menuElement.removeEventListener("mouseleave", handleMouseLeave)
        menuElement.removeEventListener("mouseenter", handleMouseEnter)
      }
    }
  }, [isOpen, close])
  
  return {
    isOpen,
    ref,
    open,
    close,
    toggle,
  }
} 