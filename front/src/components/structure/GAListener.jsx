// src/components/GAListener.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function GAListener() {
  const location = useLocation()

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-KVZX63W9GC', {
        page_path: location.pathname + location.search,
      })
    }
  }, [location])

  return null
}