import { Link, linkOptions, useLocation } from "@tanstack/react-router"
import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"

export function HeaderNavigation() {
  const { t } = useTranslation()
  const options = linkOptions([
    { to: '/', label: t('navigation.dashboard'), activeOptions: { exact: true } },
    { to: '/~/settings', label: t('navigation.settings') },
  ])

  const location = useLocation()
  const [hoverStyle, setHoverStyle] = useState({ width: 0, left: 0, opacity: 0 })
  const [activeStyle, setActiveStyle] = useState({ width: 0, left: 0, opacity: 0 })
  const containerRef = useRef<HTMLDivElement | null>(null)

  const updateHover = (element: HTMLElement | null) => {
    if (!element || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    setHoverStyle({ width: elementRect.width, left: elementRect.left - containerRect.left, opacity: 1 })
  }

  const hideHover = () => setHoverStyle(prev => ({ ...prev, opacity: 0 }))

  const updateActive = (element: HTMLElement | null) => {
    if (!element || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    setActiveStyle({ width: elementRect.width, left: elementRect.left - containerRect.left, opacity: 1 })
  }

  useEffect(() => {
    const activeLink = containerRef.current?.querySelector('[data-status="active"]') as HTMLElement
    if (activeLink) {
      updateActive(activeLink)
    } else {
      setActiveStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }, [location.pathname])

  return (
    <div className="relative">
      <div ref={containerRef} className="flex items-start relative" onMouseLeave={hideHover}>
        <div
          className="absolute top-0 transition-all duration-300 ease-out rounded bg-foreground/5"
          style={{
            width: `${hoverStyle.width}px`,
            left: `${hoverStyle.left}px`,
            opacity: hoverStyle.opacity,
            bottom: "0.5rem",
          }}
        />

        <div
          className="absolute bottom-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${activeStyle.width}px`,
            left: `${activeStyle.left}px`,
            opacity: activeStyle.opacity,
          }}
        />

        {options.map((option) => (
          <Link
            {...option}
            key={option.to}
            activeProps={{ "data-status": "active", className: "text-foreground/100" }}
            className="relative flex h-9 items-center pb-2 text-sm font-normal text-foreground/40 transition-colors duration-300 ease-out hover:text-foreground/100 group"
            onMouseEnter={(e) => updateHover(e.currentTarget)}
            onClick={(e) => updateActive(e.currentTarget)}
          >
            <span className="relative z-10 w-full p-3 rounded text-center transition-all duration-300 ease-out">
              {option.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}