import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, useSpring, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from 'next-themes'

interface NavItem {
  label: string
  id: string
  path: string
}

/**
 * 3D Adaptive Navigation Pill
 * Smart navigation with scroll detection and hover expansion
 */
export const AdaptiveNavigationBar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resolvedTheme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = resolvedTheme === 'dark'
  
  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Início', id: 'home', path: '/' },
      { label: 'Dashboard', id: 'dashboard', path: '/dashboard' },
      { label: 'Ativos', id: 'assets', path: '/assets' },
      { label: 'Manutenções', id: 'maintenance', path: '/maintenance' },
      { label: 'Auditoria', id: 'audit', path: '/auditoria' },
      { label: 'Etiquetas', id: 'labels', path: '/labels' },
    ],
    []
  )

  const resolveActiveSection = useCallback(
    (pathname: string) => {
      if (pathname === '/') {
        return 'home'
      }

      const item = navItems.find(
        item =>
          item.path !== '/' && (pathname === item.path || pathname.startsWith(`${item.path}/`))
      )

      return item ? item.id : 'home'
    },
    [navItems]
  )

  const [activeSection, setActiveSection] = useState(() => resolveActiveSection(location.pathname))

  // Update active section when route changes
  useEffect(() => {
    setActiveSection(resolveActiveSection(location.pathname))
  }, [location.pathname, resolveActiveSection])

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === 'undefined') return
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }

    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)

    return () => {
      window.removeEventListener('resize', updateIsMobile)
    }
  }, [])

  // Spring animations for smooth motion
  const pillWidth = useSpring(140, { stiffness: 220, damping: 25, mass: 1 })

  // Handle hover expansion
  useEffect(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (isMobile) {
      setExpanded(true)
      pillWidth.set(320)
      return
    }

    if (hovering) {
      setExpanded(true)
      pillWidth.set(680)
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false)
        pillWidth.set(140)
      }, 600)
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = null
      }
    }
  }, [hovering, pillWidth, isMobile])

  const handleMouseEnter = () => {
    if (isMobile) return
    setHovering(true)
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    setHovering(false)
  }

  const handleSectionClick = (item: NavItem) => {
    // Trigger transition state
    setIsTransitioning(true)
    setActiveSection(item.id)
    
    // Navigate to the route
    navigate(item.path)
    
    // Collapse the pill after selection
    setHovering(false)
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 400)
  }

  const activeItem = navItems.find(item => item.id === activeSection)

  const navBackground = isDark
    ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.96) 0%, rgba(15, 23, 42, 0.92) 50%, rgba(30, 41, 59, 0.88) 100%)'
    : 'linear-gradient(135deg, #fcfcfd 0%, #f3f4f6 35%, #e7e9ee 70%, #e2e3e6 100%)'

  const lightShadows = {
    expanded:
      '0 2px 4px rgba(148, 163, 184, 0.25), 0 6px 18px rgba(148, 163, 184, 0.2), 0 18px 45px rgba(148, 163, 184, 0.16), inset 0 2px 2px rgba(255, 255, 255, 0.9)',
    transitioning:
      '0 3px 8px rgba(148, 163, 184, 0.25), 0 10px 30px rgba(148, 163, 184, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
    collapsed:
      '0 3px 6px rgba(148, 163, 184, 0.25), 0 12px 26px rgba(148, 163, 184, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.85)'
  }

  const darkShadows = {
    expanded:
      '0 12px 28px rgba(2, 6, 23, 0.58), 0 8px 18px rgba(15, 23, 42, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    transitioning:
      '0 8px 20px rgba(2, 6, 23, 0.55), 0 4px 12px rgba(15, 23, 42, 0.45), inset 0 1px 0 rgba(148, 163, 184, 0.25)',
    collapsed:
      '0 6px 16px rgba(2, 6, 23, 0.55), 0 2px 8px rgba(15, 23, 42, 0.45), inset 0 1px 0 rgba(148, 163, 184, 0.22)'
  }

  const shadows = isDark ? darkShadows : lightShadows
  const navShadow = expanded ? shadows.expanded : isTransitioning ? shadows.transitioning : shadows.collapsed

  const activeTextColor = isDark ? '#f8fafc' : '#1a1a1a'
  const inactiveTextColor = isDark ? '#cbd5f5' : '#656565'
  const hoverTextColor = isDark ? '#e2e8f0' : '#3a3a3a'
  const activeTextShadow = isDark
    ? '0 1px 0 rgba(2, 6, 23, 0.65), 0 -1px 0 rgba(148, 163, 184, 0.35), 1px 1px 0 rgba(2, 6, 23, 0.45)'
    : '0 1px 0 rgba(0, 0, 0, 0.35), 0 -1px 0 rgba(255, 255, 255, 0.8), 1px 1px 0 rgba(0, 0, 0, 0.18)'
  const inactiveTextShadow = isDark
    ? '0 1px 0 rgba(2, 6, 23, 0.55), 0 -1px 0 rgba(148, 163, 184, 0.2)'
    : '0 1px 0 rgba(0, 0, 0, 0.22), 0 -1px 0 rgba(255, 255, 255, 0.65)'
  const hoverTextShadow = isDark
    ? '0 1px 0 rgba(2, 6, 23, 0.45), 0 -1px 0 rgba(148, 163, 184, 0.4)'
    : '0 1px 0 rgba(0, 0, 0, 0.28), 0 -1px 0 rgba(255, 255, 255, 0.72)'

  const containerClasses = `relative z-10 flex items-center justify-center ${isMobile ? 'flex-wrap gap-2 px-3 py-3' : 'h-full px-6'}`
  const itemsWrapperClasses = `flex w-full items-center justify-evenly ${isMobile ? 'flex-wrap gap-2' : ''}`

  return (
    <motion.nav
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-full"
      style={{
        width: isMobile ? 'min(92vw, 360px)' : pillWidth,
        minHeight: '56px',
        height: isMobile ? 'auto' : '56px',
        background: navBackground,
        boxShadow: navShadow,
        border: isDark
          ? '1px solid rgba(148, 163, 184, 0.18)'
          : '1px solid rgba(148, 163, 184, 0.35)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-out, background 0.3s ease-out',
      }}
    >
      {/* Primary top edge ridge - ultra bright */}
      <div
        className="absolute inset-x-0 top-0 rounded-t-full pointer-events-none"
        style={{
          height: '2px',
          background: isDark
            ? 'linear-gradient(90deg, rgba(148, 163, 184, 0) 0%, rgba(148, 163, 184, 0.6) 5%, rgba(226, 232, 240, 0.85) 15%, rgba(226, 232, 240, 0.85) 85%, rgba(148, 163, 184, 0.6) 95%, rgba(148, 163, 184, 0) 100%)'
            : 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 5%, rgba(255, 255, 255, 1) 15%, rgba(255, 255, 255, 1) 85%, rgba(255, 255, 255, 0.95) 95%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(0.4px)',
        }}
      />

      {/* Top hemisphere light catch */}
      <div
        className="absolute inset-x-0 top-0 rounded-full pointer-events-none"
        style={{
          height: '55%',
          background: isDark
            ? 'linear-gradient(180deg, rgba(148, 163, 184, 0.35) 0%, rgba(148, 163, 184, 0.18) 40%, rgba(15, 23, 42, 0) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0.10) 60%, rgba(255, 255, 255, 0) 100%)',
        }}
      />
      
      {/* Directional light - top left */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(148, 163, 184, 0.32) 0%, rgba(30, 41, 59, 0.12) 45%, rgba(15, 23, 42, 0) 70%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.20) 20%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0) 65%)',
        }}
      />
      
      {/* Premium gloss reflection - main */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          left: expanded ? '18%' : '15%',
          top: '16%',
          width: expanded ? '140px' : '60px',
          height: '14px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.10) 70%, rgba(255, 255, 255, 0) 100%)',
          filter: 'blur(4px)',
          transform: 'rotate(-12deg)',
          transition: 'all 0.3s ease',
        }}
      />
      
      {/* Secondary gloss accent - only show when expanded */}
      {expanded && (
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            right: '22%',
            top: '20%',
            width: '80px',
            height: '10px',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.15) 60%, rgba(255, 255, 255, 0) 100%)',
            filter: 'blur(3px)',
            transform: 'rotate(8deg)',
          }}
        />
      )}
      
      {/* Left edge illumination - only show when expanded */}
      {expanded && (
        <div
          className="absolute inset-y-0 left-0 rounded-l-full pointer-events-none"
          style={{
            width: '35%',
            background: isDark
              ? 'linear-gradient(90deg, rgba(148, 163, 184, 0.25) 0%, rgba(148, 163, 184, 0.12) 40%, rgba(148, 163, 184, 0.05) 70%, rgba(148, 163, 184, 0) 100%)'
              : 'linear-gradient(90deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.10) 40%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
      )}
      
      {/* Right edge shadow - only show when expanded */}
      {expanded && (
        <div
          className="absolute inset-y-0 right-0 rounded-r-full pointer-events-none"
          style={{
            width: '35%',
            background: isDark
              ? 'linear-gradient(270deg, rgba(2, 6, 23, 0.25) 0%, rgba(2, 6, 23, 0.12) 40%, rgba(2, 6, 23, 0.05) 70%, rgba(2, 6, 23, 0) 100%)'
              : 'linear-gradient(270deg, rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.02) 70%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
      )}
      
      {/* Bottom curvature - deep shadow */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '50%',
          background: isDark
            ? 'linear-gradient(0deg, rgba(2, 6, 23, 0.38) 0%, rgba(2, 6, 23, 0.18) 25%, rgba(2, 6, 23, 0.08) 55%, rgba(2, 6, 23, 0) 100%)'
            : 'linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.03) 50%, rgba(0, 0, 0, 0) 100%)',
        }}
      />

      {/* Bottom edge contact shadow */}
      <div
        className="absolute inset-x-0 bottom-0 rounded-b-full pointer-events-none"
        style={{
          height: '20%',
          background: isDark
            ? 'linear-gradient(0deg, rgba(2, 6, 23, 0.4) 0%, rgba(2, 6, 23, 0) 100%)'
            : 'linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Inner diffuse glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: isDark
            ? 'inset 0 0 40px rgba(15, 23, 42, 0.45)'
            : 'inset 0 0 40px rgba(255, 255, 255, 0.22)',
          opacity: isDark ? 0.45 : 0.7,
        }}
      />
      
      {/* Micro edge definition */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: isDark
            ? 'inset 0 0 0 0.5px rgba(148, 163, 184, 0.2)'
            : 'inset 0 0 0 0.5px rgba(0, 0, 0, 0.10)',
        }}
      />

      {/* Navigation items container */}
      <div
        ref={containerRef}
        className={containerClasses}
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro", Poppins, sans-serif',
        }}
      >
        {/* Collapsed state - show only active section with smooth text transitions */}
        {!expanded && !isMobile && (
          <div className="flex items-center relative">
            <AnimatePresence mode="wait">
              {activeItem && (
                <motion.span
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{
                    duration: 0.35,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 680,
                    color: activeTextColor,
                    letterSpacing: '0.45px',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textShadow: activeTextShadow,
                  }}
                >
                  {activeItem.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Expanded state - show all sections with stagger */}
        {(expanded || isMobile) && (
          <div className={itemsWrapperClasses}>
            {navItems.map((item, index) => {
              const isActive = item.id === activeSection

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ 
                    delay: index * 0.08,
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  onClick={() => handleSectionClick(item)}
                  className="relative cursor-pointer transition-all duration-200"
                  style={{
                    fontSize: isActive ? '15.5px' : '15px',
                    fontWeight: isActive ? 680 : 510,
                    color: isActive ? activeTextColor : inactiveTextColor,
                    textDecoration: 'none',
                    letterSpacing: '0.45px',
                    background: 'transparent',
                    border: 'none',
                    padding: isMobile ? '8px 12px' : '10px 16px',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", Poppins, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    transform: isActive ? 'translateY(-1.5px)' : 'translateY(0)',
                    textShadow: isActive ? activeTextShadow : inactiveTextShadow,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isMobile) {
                      e.currentTarget.style.color = hoverTextColor
                      e.currentTarget.style.transform = 'translateY(-0.5px)'
                      e.currentTarget.style.textShadow = hoverTextShadow
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isMobile) {
                      e.currentTarget.style.color = inactiveTextColor
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.textShadow = inactiveTextShadow
                    }
                  }}
                >
                  {item.label}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </motion.nav>
  )
}
