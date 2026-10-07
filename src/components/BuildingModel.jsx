import React, { useMemo, useState, useEffect, Component } from 'react'
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { resolverModelo } from './BuildingModels'

// ─────────────────────────────────────────────────────────────
//  Cache de disponibilidade
// ─────────────────────────────────────────────────────────────
const glbCache = {}

async function checarArquivo(path) {
  if (glbCache[path] && glbCache[path] !== 'unknown') return glbCache[path]
  try {
    const res = await fetch(path, { method: 'HEAD' })
    glbCache[path] = res.ok ? 'ok' : 'missing'
  } catch {
    glbCache[path] = 'missing'
  }
  return glbCache[path]
}

function useResolverCaminho(arquivoBase) {
  const caminhos = useMemo(() => {
    if (!arquivoBase) return []
    const semExt = arquivoBase.replace(/\.(glb|gltf)$/i, '')
    return [semExt + '.glb', semExt + '.gltf']
  }, [arquivoBase])

  const [resultado, setResultado] = useState(() => {
    if (!arquivoBase || caminhos.length === 0) return { path: null, status: 'missing' }
    for (const p of caminhos) {
      if (glbCache[p] === 'ok')      return { path: p,    status: 'ready'   }
      if (glbCache[p] === 'missing') continue
    }
    if (caminhos.every(p => glbCache[p] === 'missing')) {
      return { path: null, status: 'missing' }
    }
    return { path: null, status: 'loading' }
  })

  useEffect(() => {
    if (!arquivoBase || caminhos.length === 0) {
      setResultado({ path: null, status: 'missing' })
      return
    }

    let cancelled = false

    async function resolver() {
      for (const p of caminhos) {
        const s = await checarArquivo(p)
        if (cancelled) return
        if (s === 'ok') {
          setResultado({ path: p, status: 'ready' })
          return
        }
      }
      if (!cancelled) setResultado({ path: null, status: 'missing' })
    }

    if (resultado.status === 'loading') resolver()
    
    return () => { cancelled = true }
  }, [caminhos, arquivoBase])

  return resultado
}

// ─────────────────────────────────────────────────────────────
//  ErrorBoundary
// ─────────────────────────────────────────────────────────────
class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) {
    if (!error?.message?.includes('Could not load')) {
      console.warn('[BuildingModel]', error?.message)
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.hasError !== nextState.hasError
  }
  render() {
    return this.state.hasError
      ? (this.props.fallback ?? null)
      : this.props.children
  }
}

// ─────────────────────────────────────────────────────────────
//  Fallback visual (COM GEOMETRIAS MEMOIZADAS)
// ─────────────────────────────────────────────────────────────
export function ModeloFallback({ cor = '#888888', config = {} }) {
  const hasShadows = config?.buildingShadows ?? true
  
  const geometryBox = useMemo(() => new THREE.BoxGeometry(0.28, 0.18, 0.28), [])
  const geometryCone = useMemo(() => new THREE.ConeGeometry(0.22, 0.16, 4), [])
  
  return (
    <group>
      <mesh position={[0, 0.09, 0]} castShadow={hasShadows}>
        <primitive object={geometryBox} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.24, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={hasShadows}>
        <primitive object={geometryCone} />
        <meshStandardMaterial color={cor} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
//  Loader COM colormap
// ─────────────────────────────────────────────────────────────
function ModeloComColormap({ 
  glbPath, 
  colormap, 
  escalaVec, 
  posY, 
  rotacao, 
  rotacaoCorrecao, 
  corTint,
  config = {} 
}) {
  const { scene } = useGLTF(glbPath)
  const textura = useTexture(colormap)
  const hasShadows = config?.buildingShadows ?? true

  const clonado = useMemo(() => {
    textura.flipY = false
    textura.colorSpace = THREE.SRGBColorSpace
    textura.needsUpdate = true

    const clone = scene.clone(true)
    clone.traverse(node => {
      if (!node.isMesh) return
      const mat = node.material.clone()
      mat.map = textura
      mat.roughness = 0.85
      mat.metalness = 0.05
      if (corTint) {
        mat.color = new THREE.Color(...corTint)
      }
      mat.needsUpdate = true
      node.material = mat
      node.castShadow = hasShadows
      node.receiveShadow = hasShadows
    })
    return clone
  }, [scene, textura, corTint, hasShadows])

  return (
    <primitive
      object={clonado}
      position={[0, posY ?? 0, 0]}
      rotation={[
        rotacaoCorrecao?.[0] ?? 0,
        (rotacaoCorrecao?.[1] ?? 0) + (rotacao ?? 0),
        rotacaoCorrecao?.[2] ?? 0,
      ]}
      scale={escalaVec ?? [1, 1, 1]}
    />
  )
}

// ─────────────────────────────────────────────────────────────
//  Loader SEM colormap
// ─────────────────────────────────────────────────────────────
function ModeloSemColormap({ 
  glbPath, 
  escalaVec, 
  posY, 
  rotacao, 
  rotacaoCorrecao, 
  corTint,
  config = {} 
}) {
  const { scene } = useGLTF(glbPath)
  const hasShadows = config?.buildingShadows ?? true

  const clonado = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse(node => {
      if (!node.isMesh) return
      const mat = node.material.clone()
      if (corTint) {
        mat.color = new THREE.Color(...corTint)
        mat.needsUpdate = true
      }
      node.material = mat
      node.castShadow = hasShadows
      node.receiveShadow = hasShadows
    })
    return clone
  }, [scene, corTint, hasShadows])

  return (
    <primitive
      object={clonado}
      position={[0, posY ?? 0, 0]}
      rotation={[
        rotacaoCorrecao?.[0] ?? 0,
        (rotacaoCorrecao?.[1] ?? 0) + (rotacao ?? 0),
        rotacaoCorrecao?.[2] ?? 0,
      ]}
      scale={escalaVec ?? [1, 1, 1]}
    />
  )
}

// ─────────────────────────────────────────────────────────────
//  Loader interno
// ─────────────────────────────────────────────────────────────
function ModeloLoader({ config, corFallback, graphicsConfig = {} }) {
  const { path, status } = useResolverCaminho(config?.glbPath ?? null)

  const fallbackEl = useMemo(
    () => <ModeloFallback cor={corFallback} config={graphicsConfig} />,
    [corFallback, graphicsConfig]
  )

  if (!config?.glbPath) return fallbackEl
  if (status === 'loading') return fallbackEl
  if (status === 'missing' || !path) return fallbackEl

  return (
    <ModelErrorBoundary fallback={fallbackEl}>
      <React.Suspense fallback={fallbackEl}>
        {config.colormap ? (
          <ModeloComColormap
            glbPath={path}
            colormap={config.colormap}
            escalaVec={config.escalaVec}
            posY={config.posY}
            rotacao={config.rotacao}
            rotacaoCorrecao={config.rotacaoCorrecao}
            corTint={config.corTint}
            config={graphicsConfig}
          />
        ) : (
          <ModeloSemColormap
            glbPath={path}
            escalaVec={config.escalaVec}
            posY={config.posY}
            rotacao={config.rotacao}
            rotacaoCorrecao={config.rotacaoCorrecao}
            corTint={config.corTint}
            config={graphicsConfig}
          />
        )}
      </React.Suspense>
    </ModelErrorBoundary>
  )
}

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PÚBLICO - COM SUPORTE A CONFIGURAÇÃO GRÁFICA
// ─────────────────────────────────────────────────────────────
export function BuildingModel({ 
  nomeEdificio, 
  corFallback = '#888888', 
  posicaoBase = [0, 0, 0], 
  _overrideConfig = null, 
  _overrideModeloId = null,
  graphicsConfig = {}
}) {
  const config = useMemo(() => {
    return _overrideConfig
      ?? (_overrideModeloId != null ? resolverModelo(null, _overrideModeloId) : null)
      ?? resolverModelo(nomeEdificio)
  }, [_overrideConfig, _overrideModeloId, nomeEdificio])

  // 🔹 SIMPLES
  if (config?.tipo === 'simples') {
    return (
      <group position={posicaoBase}>
        <ModeloLoader 
          config={config} 
          corFallback={corFallback}
          graphicsConfig={graphicsConfig}
        />
      </group>
    )
  }

  // 🔥 COMPOSTO
  if (config?.tipo === 'composto') {
    return (
      <group position={posicaoBase}>
        {config.partes.map((parte, i) => (
          <group
            key={i}
            position={parte.offset || [0, 0, 0]}
            rotation={[0, parte.rotacaoExtra ?? 0, 0]}
            scale={parte.escalaVec.map(v => v * (parte.escalaExtra ?? 1))}
          >
            <ModeloLoader 
              config={parte} 
              corFallback={corFallback}
              graphicsConfig={graphicsConfig}
            />
          </group>
        ))}
      </group>
    )
  }

  // Config inválida → fallback
  return (
    <group position={posicaoBase}>
      <ModeloFallback cor={corFallback} config={graphicsConfig} />
    </group>
  )
}