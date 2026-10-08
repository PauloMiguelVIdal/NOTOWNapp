// src/components/MapWorldCity.jsx
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import { resolverModeloSede, MODELOS, EDIFICIO_PARA_MODELO } from './BuildingModels'
import { useFrame } from '@react-three/fiber'
import { useGraphicsConfig } from './GraphicsConfigContext'
import { Building2, Move } from 'lucide-react'

const HEX_SIZE = 0.6

const hexToWorld = (hex, size) => ({
  x: size * 1.73 * (hex.q + hex.r / 2),
  z: size * 1.5 * hex.r,
})

// ─────────────────────────────────────────────────────────────
//  CÂMERA — DEFAULTS
// ─────────────────────────────────────────────────────────────
const CAMERA_DEFAULTS = {
  position: [3, 3, 3],       // 🔥 posição padrão (diorama 3/4)
  fov: 35,
  target: [0, 0, 0],
  minDistance: 3,
  maxDistance: 20,
  minPolarAngle: Math.PI / 4,
  maxPolarAngle: Math.PI / 2.8,
  autoRotate: false,
  autoRotateSpeed: 0.5,
}

// ─────────────────────────────────────────────────────────────
//  Cache de verificação
// ─────────────────────────────────────────────────────────────
const edificioEhComposto = (() => {
  const cache = new Map()
  return (nomeEdificio) => {
    if (cache.has(nomeEdificio)) return cache.get(nomeEdificio)
    const modeloId = EDIFICIO_PARA_MODELO[nomeEdificio]
    const result = modeloId ? MODELOS[modeloId]?.tipo === 'composto' : false
    cache.set(nomeEdificio, result)
    return result
  }
})()

// ─────────────────────────────────────────────────────────────
//  Config de setores
// ─────────────────────────────────────────────────────────────
const SETOR_CONFIG = {
  agricultura: { label: 'Agricultura', cor1: '#003816', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia: { label: 'Tecnologia', cor1: '#A64B00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria: { label: 'Indústria', cor1: '#1A1A1A', cor3: '#808080', cor4: '#B3B3B3' },
  comercio: { label: 'Comércio', cor1: '#660000', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario: { label: 'Imobiliário', cor1: '#000066', cor3: '#3333CC', cor4: '#6666FF' },
  energia: { label: 'Energia', cor1: '#665200', cor3: '#E6B800', cor4: '#FFD966' },
  outros: { label: 'Outros', cor1: '#111111', cor3: '#555555', cor4: '#888888' },
}

// ─────────────────────────────────────────────────────────────
//  CAMADA 1: CÉU
// ─────────────────────────────────────────────────────────────
const SkyDome = React.memo(({ dayProgress }) => {
  const uniforms = useMemo(() => ({
    topColor: { value: new THREE.Color('#4c2da0') },
    middleColor: { value: new THREE.Color('#F27405') },
    bottomColor: { value: new THREE.Color('#6411D9') },
    uProgress: { value: 0 },
  }), [])

  useEffect(() => { uniforms.uProgress.value = dayProgress }, [dayProgress, uniforms])

  return (
    <mesh scale={[8, 6, 8]} position={[0, 0.01, 0]}>
      <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <shaderMaterial
        side={THREE.BackSide}
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 topColor;
          uniform vec3 middleColor;
          uniform vec3 bottomColor;
          uniform float uProgress;

          void main() {
            float h = vUv.y;
            vec3 gradient = mix(bottomColor, middleColor, smoothstep(0.0, 0.5, h));
            gradient = mix(gradient, topColor, smoothstep(0.3, 1.0, h));
            float sunset = uProgress * 0.6;
            vec3 sunsetColor = vec3(1.0, 0.4, 0.1);
            gradient = mix(gradient, sunsetColor, sunset * (1.0 - h));
            float alpha = smoothstep(0.0, 0.1, h) * 0.95;
            gl_FragColor = vec4(gradient, alpha);
          }
        `}
      />
    </mesh>
  )
})

// ─────────────────────────────────────────────────────────────
//  CAMADA 2: MAR
// ─────────────────────────────────────────────────────────────
const Ocean = React.memo(() => {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorBase: { value: new THREE.Color('#0066cc') },
    uColorDeep: { value: new THREE.Color('#001a33') },
  }), [])

  useFrame((state) => { uniforms.uTime.value = state.clock.elapsedTime })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColorBase;
          uniform vec3 uColorDeep;

          void main() {
            vec2 st = vUv * 30.0;
            float wave1 = sin(st.x + uTime * 0.5) * cos(st.y + uTime * 0.3) * 0.5 + 0.5;
            float wave2 = sin(st.y - uTime * 0.4) * cos(st.x - uTime * 0.2) * 0.5 + 0.5;
            float waveStrength = mix(wave1, wave2, 0.5);
            vec3 finalColor = mix(uColorDeep, uColorBase, waveStrength);
            float alpha = mix(0.15, 0.5, waveStrength);
            float dist = distance(vUv, vec2(0.5, 0.5)) * 2.0;
            alpha = mix(alpha, 1.0, smoothstep(0.95, 1.0, dist));
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </mesh>
  )
})

// ─────────────────────────────────────────────────────────────
//  CAMADA 3: HEX BASE
// ─────────────────────────────────────────────────────────────
const HexBase = React.memo(({
  corTopo = '#5a9e44',
  config = {},
  selected = false,
  hovered = false,
  moveMode = false
}) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6
      const v = HEX_SIZE * 1.015
      i === 0 ? s.moveTo(v * Math.cos(angle), v * Math.sin(angle))
        : s.lineTo(v * Math.cos(angle), v * Math.sin(angle))
    }
    s.closePath()
    return s
  }, [])

  const hasShadows = config?.hexShadows ?? true

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow={hasShadows} receiveShadow={hasShadows}>
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2 }]} />
        <meshStandardMaterial color="#4a7230" roughness={0.9} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow={hasShadows}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={corTopo} roughness={0.8} metalness={0} />
      </mesh>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.87, HEX_SIZE * 0.99, 6]} />
          <meshBasicMaterial color="#F27405" transparent opacity={0.95} />
        </mesh>
      )}

      {moveMode && hovered && !selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.87, HEX_SIZE * 0.99, 6]} />
          <meshBasicMaterial color="#d4f08a" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  HexTileClusterSatelite
// ─────────────────────────────────────────────────────────────
const HexTileClusterSatelite = React.memo(({ hex, corTopo, modeloId, corFallback, config = {} }) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  return (
    <group position={[x, 0, z]}>
      <HexBase corTopo={corTopo} config={config} />
      {modeloId != null && (
        <BuildingModel
          nomeEdificio={null}
          corFallback={corFallback || '#888888'}
          posicaoBase={[0, 0.22, 0]}
          _overrideModeloId={modeloId}
          graphicsConfig={config}
        >
          <Html position={[0, 3.0, 0]} center distanceFactor={8}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(76,20,169,0.95), rgba(30,8,80,0.95))',
              border: '1.5px solid rgba(199,159,255,0.6)',
              borderRadius: 10, padding: '4px 12px',
              fontFamily: "'Rajdhani',sans-serif",
              fontWeight: 800, fontSize: 20, color: '#fff',
              textTransform: 'uppercase',
              boxShadow: '0 0 18px rgba(100,17,217,0.55)',
            }}>
             'oliii'
            </div>
          </Html>
        </BuildingModel>
      )}
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  HexTile
// ─────────────────────────────────────────────────────────────
const HexTile = React.memo(({
  hex,
  building,
  onClick,
  selected,
  moveMode,
  config = {},
  onHover,
  isHovered,
  isBlocked,
}) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  const groupRef = useRef()
  const [targetY, setTargetY] = useState(0)

  useEffect(() => {
    if (selected) setTargetY(0.14)
    else if (isHovered) setTargetY(0.06)
    else setTargetY(0)
  }, [selected, isHovered])

  useFrame(() => {
    if (!groupRef.current) return
    const currentY = groupRef.current.position.y
    const diff = targetY - currentY
    if (Math.abs(diff) > 0.001) {
      groupRef.current.position.y = currentY + diff * 0.15
    } else {
      groupRef.current.position.y = targetY
    }
  })

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onClick(hex)
  }, [onClick, hex])

  const handleOver = useCallback((e) => {
    e.stopPropagation()
    if (onHover) onHover(`${hex.q},${hex.r}`, true)
  }, [onHover, hex])

  const handleOut = useCallback((e) => {
    e.stopPropagation()
    if (onHover) onHover(`${hex.q},${hex.r}`, false)
  }, [onHover, hex])

  return (
    <group
      ref={groupRef}
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <HexBase
        corTopo={building ? SETOR_CONFIG[building.setor]?.cor3 : undefined}
        config={config}
        selected={selected}
        hovered={isHovered}
        moveMode={moveMode}
      />

      {building && (
        <BuildingModel
          nomeEdificio={building.nome}
          corFallback={SETOR_CONFIG[building.setor]?.cor4 || '#888888'}
          posicaoBase={[0, 0.22, 0]}
          graphicsConfig={config}
        />
      )}

      {moveMode && isHovered && isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.5, HEX_SIZE * 0.65, 6]} />
          <meshBasicMaterial color="#ff2222" transparent opacity={0.7} />
        </mesh>
      )}

      {moveMode && isHovered && !isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.45, HEX_SIZE * 0.58, 6]} />
          <meshBasicMaterial color="#F27405" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  CAMADA 4: SEDE
// ─────────────────────────────────────────────────────────────
const Sede = React.memo(({ nomeEmpresa, porte, config = {} }) => {
  const sedeConfig = useMemo(() => resolverModeloSede(porte), [porte])

  return (
    <group position={[0, 0, 0]}>
      <HexBase corTopo="#4a7230" config={config} />
      <BuildingModel
        key={`sede-${porte}`}
        nomeEdificio={null}
        corFallback="#888888"
        posicaoBase={[0, 0.22, 0]}
        _overrideConfig={sedeConfig}
        graphicsConfig={config}
      />
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  LUZES
// ─────────────────────────────────────────────────────────────
const Lights = React.memo(({ config = {} }) => {
  const hasShadows = config?.shadows ?? true
  const mapSize = config?.shadowMapSize ?? 1024
  const bias = config?.shadowBias ?? -0.001

  return (
    <>
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.5}
        color="#ffffff"
        castShadow={hasShadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={bias}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <ambientLight intensity={0.4} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={0.8} color="#dbb2ff" />
      <hemisphereLight args={['#ffee00', '#ff5500', 0.5]} />
    </>
  )
})

// ─────────────────────────────────────────────────────────────
//  BANNER DE MOVE MODE
// ─────────────────────────────────────────────────────────────
const MoveBanner = ({ onCancel }) => (
  <div style={{
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 70,
    background: 'linear-gradient(135deg,rgba(242,116,5,0.95),rgba(175,78,0,0.95))',
    border: '1.5px solid #F27405',
    boxShadow: '0 0 20px rgba(242,116,5,0.6), 0 4px 12px rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: "'Rajdhani','Segoe UI',sans-serif",
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '.07em',
    textTransform: 'uppercase',
    pointerEvents: 'auto',
  }}>
    <Move size={16} strokeWidth={2.8} />
    <span>Selecione o destino</span>
    <button
      onClick={onCancel}
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 7,
        padding: '4px 11px',
        cursor: 'pointer',
        color: '#fff',
        fontFamily: "'Rajdhani','Segoe UI',sans-serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '.06em',
      }}
    >
      Cancelar
    </button>
  </div>
)

// ─────────────────────────────────────────────────────────────
//  PAINEL DO EDIFÍCIO SELECIONADO
// ─────────────────────────────────────────────────────────────
const PainelSelecionado = ({ building, isFullscreen, moveMode, onMover, onFechar }) => {
  if (!building) return null
  const cfg = SETOR_CONFIG[building.setor] || SETOR_CONFIG.outros

  return (
    <div
      style={{
        position: 'absolute',
        right: 20,
        bottom: 20,
        zIndex: 70,
        pointerEvents: 'none',
        fontFamily: "'Rajdhani','Segoe UI',sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
        minWidth: 220,
        maxWidth: 280,
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(12,8,28,0.95), rgba(26,14,58,0.95))',
        border: `1.5px solid ${cfg.cor4}88`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 16px ${cfg.cor3}44`,
        borderRadius: 12,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `linear-gradient(135deg, ${cfg.cor3} 0%, ${cfg.cor1} 100%)`,
          border: `1px solid ${cfg.cor4}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <Building2 size={18} strokeWidth={2.5} color="#fff" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            color: '#fff', fontWeight: 800, fontSize: 14,
            letterSpacing: '0.04em',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {building.nome}
          </div>
          <div style={{
            color: cfg.cor4,
            fontSize: 11, fontWeight: 600, marginTop: 2, opacity: 0.85,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {cfg.label}
          </div>
        </div>
      </div>

      {isFullscreen && !moveMode && (
        <button
          onClick={onMover}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'linear-gradient(135deg,#4C14A9,#6411D9)',
            border: '1px solid rgba(199,159,255,0.5)',
            borderRadius: 10,
            padding: '8px 14px',
            cursor: 'pointer',
            color: '#fff',
            fontFamily: "'Rajdhani','Segoe UI',sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: '.08em',
            boxShadow: '0 0 14px rgba(100,17,217,0.5)',
            textTransform: 'uppercase',
          }}
        >
          <Move size={14} strokeWidth={2.8} />
          Mover edifício
        </button>
      )}
{/* 
      {!isFullscreen && (
        <div style={{
          background: 'rgba(242,116,5,0.15)',
          border: '1px solid rgba(242,116,5,0.4)',
          borderRadius: 10,
          padding: '6px 12px',
          color: '#FFB060',
          fontSize: 10, fontWeight: 700,
          letterSpacing: '.06em',
          textAlign: 'center',
        }}>
          ⛶ Entre em fullscreen para mover
        </div>
      )} */}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
//  COMPONENTE PÚBLICO — COM CÂMERA CONFIGURÁVEL
// ═════════════════════════════════════════════════════════════
export default function MapWorld({
  // ─── Dados ───
  porte,
  edificiosAtivos = ['Padaria'],
  posicoes = {},
  satelites = {},
  tilesToRender = [],
  hexMap,
  edificioPorId,

  // ─── Interação ───
  selectedKey,
  moveMode,
  hoveredKey,
  isFullscreen = false,

  // ─── Handlers ───
  onHexClick,
  onHover,
  onMover,
  onCancelarMove,
  onFecharPainel,
  onMapReady,

  // 🔥 ─── CÂMERA (novo) ───
  cameraPosition,
  cameraFov,
  cameraTarget,
  minDistance,
  maxDistance,
  minPolarAngle,
  maxPolarAngle,
  autoRotate,
  autoRotateSpeed,
  dayProgress = 0,
  /** true = só renderiza o 3D, sem painéis/banners */
  minimalist = false,
  /** desabilita OrbitControls (para mini mapas estáticos) */
  disableControls = false,
}) {
  const { config: graphicsConfig } = useGraphicsConfig()

  // Merge com defaults
  const cam = useMemo(() => ({
    position: cameraPosition ?? CAMERA_DEFAULTS.position,
    fov: cameraFov ?? CAMERA_DEFAULTS.fov,
    target: cameraTarget ?? CAMERA_DEFAULTS.target,
    minDistance: minDistance ?? CAMERA_DEFAULTS.minDistance,
    maxDistance: maxDistance ?? CAMERA_DEFAULTS.maxDistance,
    minPolarAngle: minPolarAngle ?? CAMERA_DEFAULTS.minPolarAngle,
    maxPolarAngle: maxPolarAngle ?? CAMERA_DEFAULTS.maxPolarAngle,
    autoRotate: autoRotate ?? CAMERA_DEFAULTS.autoRotate,
    autoRotateSpeed: autoRotateSpeed ?? CAMERA_DEFAULTS.autoRotateSpeed,
  }), [
    cameraPosition, cameraFov, cameraTarget,
    minDistance, maxDistance,
    minPolarAngle, maxPolarAngle,
    autoRotate, autoRotateSpeed,
  ])

  // Edifício selecionado
  const selectedBuilding = useMemo(() => {
    if (!selectedKey) return null
    const id = posicoes[selectedKey]
    return id ? edificioPorId?.get(id) || null : null
  }, [selectedKey, posicoes, edificioPorId])

  const canvasConfig = useMemo(() => ({
    shadows: graphicsConfig.shadows,
    antialias: graphicsConfig.antialias,
  }), [graphicsConfig])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', backgroundColor: '#350973' }}>

      {/* Painel do edifício selecionado (só se não for minimalista) */}
      {!minimalist && selectedBuilding && !moveMode && (
        <PainelSelecionado
          building={selectedBuilding}
          isFullscreen={isFullscreen}
          moveMode={moveMode}
          onMover={onMover}
          onFechar={onFecharPainel}
        />
      )}

      {/* Banner de modo mover (só se não for minimalista) */}
      {!minimalist && moveMode && (
        <MoveBanner onCancel={onCancelarMove} />
      )}

      <Canvas
        frameloop={moveMode || hoveredKey ? 'always' : 'demand'}
        shadows={canvasConfig.shadows}
        gl={{
          antialias: canvasConfig.antialias,
          powerPreference: 'high-performance',
        }}
        // 🔥 Câmera configurável
        camera={{
          position: cam.position,
          fov: cam.fov,
        }}
        onPointerMissed={() => {
          if (!moveMode && !minimalist) onFecharPainel?.()
        }}
        onCreated={() => {
          onMapReady?.()
        }}
      >
        <SkyDome dayProgress={dayProgress} />

        {graphicsConfig.oceanWaves ? (
          <Ocean />
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <circleGeometry args={[8, 32]} />
            <meshStandardMaterial color="#003366" roughness={0.3} metalness={0.1} />
          </mesh>
        )}

        <Lights config={graphicsConfig} />

        <group>
          <Sede
            nomeEmpresa={'FitCity'}
            porte={porte}
            config={graphicsConfig}
          />

          {/* Satélites */}
          {Object.entries(satelites).map(([key, { corTopo, modeloId, corFallback }]) => {
            if (key === '0,0') return null
            const hex = hexMap?.get(key)
            if (!hex) return null
            return (
              <HexTileClusterSatelite
                key={`sat-${key}`}
                hex={hex}
                corTopo={corTopo}
                modeloId={modeloId}
                corFallback={corFallback}
                config={graphicsConfig}
              />
            )
          })}

          {/* Tiles */}
          {tilesToRender.map(({ hex, key }) => {
            const edId = posicoes[key]
            const building = edId ? edificioPorId?.get(edId) || null : null
            return (
              <HexTile
                key={key}
                hex={hex}
                building={building}
                onClick={onHexClick}
                selected={key === selectedKey}
                moveMode={moveMode}
                config={graphicsConfig}
                onHover={onHover}
                isHovered={hoveredKey === key}
                isBlocked={moveMode && hoveredKey === key}
              />
            )
          })}
        </group>

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={graphicsConfig.contactShadowsOpacity}
          scale={graphicsConfig.contactShadowsScale}
          blur={graphicsConfig.contactShadowsBlur}
          color="#1a3a10"
        />

        {!disableControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={!moveMode}
            enableRotate={!moveMode}
            rotateSpeed={0.5}
            // 🔥 Controles configuráveis
            minPolarAngle={cam.minPolarAngle}
            maxPolarAngle={cam.maxPolarAngle}
            minDistance={cam.minDistance}
            maxDistance={cam.maxDistance}
            target={cam.target}
            enableDamping={true}
            dampingFactor={0.08}
            autoRotate={cam.autoRotate && !moveMode}
            autoRotateSpeed={cam.autoRotateSpeed}
          />
        )}
      </Canvas>
    </div>
  )
}