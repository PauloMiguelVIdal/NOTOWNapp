// ============================================================
//  GraphicsConfigContext.jsx - Sistema de Configuração Gráfica
// ============================================================

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'

// ─── MODOS DE QUALIDADE ──────────────────────────────────────────
export const QUALITY_MODES = {
  PERFORMANCE: 'performance',
  BALANCED: 'balanced',
  QUALITY: 'quality'
}

// ─── CONFIGURAÇÕES POR MODO ──────────────────────────────────────
export const QUALITY_CONFIGS = {
  [QUALITY_MODES.PERFORMANCE]: {
    label: '⚡ Performance',
    description: 'Máxima performance, qualidade reduzida',
    shadows: false,
    shadowMapSize: 512,
    antialias: false,
    contactShadowsOpacity: 0.2,
    contactShadowsScale: 15,
    contactShadowsBlur: 1.0,
    hexShadows: false,
    buildingShadows: true,
    oceanWaves: false,
    fog: false,
    autoRotate: true,
    autoRotateSpeed:1.2,
    shadowBias: -0.001,
    shadowCameraNear: 0.5,
    shadowCameraFar: 50,
    shadowCameraLeft: -20,
    shadowCameraRight: 20,
    shadowCameraTop: 20,
    shadowCameraBottom: -20,
  },
  [QUALITY_MODES.BALANCED]: {
    label: '⚖️ Balanceado',
    description: 'Bom equilíbrio entre performance e qualidade',
    shadows: true,
    shadowMapSize: 1024,
    antialias: true,
    contactShadowsOpacity: 0.3,
    contactShadowsScale: 25,
    contactShadowsBlur: 1.8,
    hexShadows: true,
    buildingShadows: true,
    oceanWaves: true,
    fog: true,
    autoRotate: true,
    autoRotateSpeed: 1.2,
    shadowBias: -0.001,
    shadowCameraNear: 0.5,
    shadowCameraFar: 50,
    shadowCameraLeft: -20,
    shadowCameraRight: 20,
    shadowCameraTop: 20,
    shadowCameraBottom: -20,
  },
  [QUALITY_MODES.QUALITY]: {
    label: '🎨 Qualidade',
    description: 'Máxima qualidade visual',
    shadows: true,
    shadowMapSize: 2048,
    antialias: true,
    contactShadowsOpacity: 0.5,
    contactShadowsScale: 35,
    contactShadowsBlur: 2.5,
    hexShadows: true,
    buildingShadows: true,
    oceanWaves: true,
    fog: true,
    autoRotate: true,
    autoRotateSpeed:1.2,
    shadowBias: -0.0005,
    shadowCameraNear: 0.1,
    shadowCameraFar: 60,
    shadowCameraLeft: -25,
    shadowCameraRight: 25,
    shadowCameraTop: 25,
    shadowCameraBottom: -25,
  }
}

// ─── CONTEXT ──────────────────────────────────────────────────────
const GraphicsConfigContext = createContext()

export const useGraphicsConfig = () => {
  const context = useContext(GraphicsConfigContext)
  if (!context) {
    throw new Error('useGraphicsConfig must be used within GraphicsConfigProvider')
  }
  return context
}

// ─── PROVIDER ─────────────────────────────────────────────────────
export const GraphicsConfigProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('graphicsMode')
    return saved && QUALITY_CONFIGS[saved] ? saved : QUALITY_MODES.BALANCED
  })

  const config = useMemo(() => QUALITY_CONFIGS[mode], [mode])

  const changeMode = useCallback((newMode) => {
    if (QUALITY_CONFIGS[newMode]) {
      setMode(newMode)
      localStorage.setItem('graphicsMode', newMode)
    }
  }, [])

  const toggleMode = useCallback(() => {
    const modes = Object.values(QUALITY_MODES)
    const currentIndex = modes.indexOf(mode)
    const nextIndex = (currentIndex + 1) % modes.length
    changeMode(modes[nextIndex])
  }, [mode, changeMode])

  const value = useMemo(() => ({
    mode,
    config,
    changeMode,
    toggleMode,
    isPerformance: mode === QUALITY_MODES.PERFORMANCE,
    isBalanced: mode === QUALITY_MODES.BALANCED,
    isQuality: mode === QUALITY_MODES.QUALITY,
  }), [mode, config, changeMode, toggleMode])

  return (
    <GraphicsConfigContext.Provider value={value}>
      {children}
    </GraphicsConfigContext.Provider>
  )
}