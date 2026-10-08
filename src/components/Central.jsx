import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"

import MapWorld from "./MapWorldCity"

import { defineHex, Grid, spiral } from 'honeycomb-grid'
import { useNotownStore } from "../store/notownStore"
import { object } from "motion/react-client"
export default function Central() {

  const [selectedKey, setSelectedKey] = useState(null)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)

  const cidade = useNotownStore((s) => s.cidade)
  const posicionarCarta = useNotownStore((s) => s.posicionarCartaPatrimonio)

  const raioMapa = 4
  const HEX_SIZE = 0.6
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioMapa })))
  }, [raioMapa])
  const hexMap = useMemo(() => {
    const map = new Map()
    hexGrid.forEach((h) => map.set(`${h.q},${h.r}`, h))
    return map
  }, [hexGrid])

  const pastasArquivos = [
    { nome:'Javascript',quantidade: 3 }, 
    {nome:'Node', quantidade:2 }, 
    { nome:'React',quantidade: 2 }, 
    {nome: 'Next',quantidade: 1 },]

// const edificiosAtivos = useMemo(() => {
//   return pastasArquivos?.flatMap((pasta) =>
//     Array.from({ length: pasta.quantidade }, (_, i) => ({
//       id: `${pasta.nome}-${i}`,
//       nome: pasta.nome,
//       setor: 'tecnologia',
//       quantidade: pasta.quantidade
//     }))
//   )
// }, [pastasArquivos])

const edificiosAtivos = useMemo(() => {
  return pastasArquivos?.map((pasta, i) =>
    ({
  
      id: `${pasta.nome}-${i}`,
      nome: pasta.nome,
      setor: 'tecnologia',
      quantidade: pasta.quantidade
    }
    )
  )
  
}, [pastasArquivos])

  const posicoes = useMemo(() => {
  const livres = hexGrid
    .map(h => `${h.q},${h.r}`)
    .filter(k => k !== '0,0')

  const mapa = {}
  edificiosAtivos.forEach((ed, i) => {
    if (ed && livres[i]) mapa[livres[i]] = ed.id   
  })
  return mapa
}, [hexGrid, edificiosAtivos])

// rerenderizando o mapa
//dependendo cada um ele renderiza novamente
//renderizando conforme a quantidade


  const edificioPorId = useMemo(() => {
    const map = new Map()
    edificiosAtivos.forEach((e) => map.set(e.id, e))
    return map
  }, [edificiosAtivos])


  useEffect(() => {
  console.log('edificiosAtivos:', edificiosAtivos)
  console.log('primeiro:', edificiosAtivos[0])
  console.log('edificioPorId size:', edificioPorId.size)
}, [edificiosAtivos, edificioPorId])

  const satelites = useMemo(() => {
    const mapa = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed?.ehCluster) return

      const modeloId = EDIFICIO_PARA_MODELO[ed.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null
      const defSats = modeloDef?.satelites || []

      const [q, r] = key.split(',').map(Number)
      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          mapa[vk] = {
            corTopo: undefined,
            corFallback: '#888888',
            modeloId: defSats[i]?.modeloId ?? null,
          }
        }
      })
    })
    return mapa
  }, [posicoes, edificioPorId])

  // ─── Fullscreen + Loading ───
  const mapWrapperRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : true
  )
  const [mapReady, setMapReady] = useState(false)
  const [mapTimeoutId, setMapTimeoutId] = useState(null)

  const handleMapReady = useCallback(() => {
    const id = setTimeout(() => setMapReady(true), 400)
    setMapTimeoutId(id)
  }, [])

  useEffect(() => {
    return () => { if (mapTimeoutId) clearTimeout(mapTimeoutId) }
  }, [mapTimeoutId])

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const handleOrientation = (e) => setIsPortrait(e.matches)
    mq.addEventListener('change', handleOrientation)
    return () => mq.removeEventListener('change', handleOrientation)
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) {
        setMoveMode(false)
        setSelectedKey(null)
        setHoveredKey(null)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const el = mapWrapperRef.current
    if (!el) return

    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen()
        if (screen.orientation?.lock) {
          try { await screen.orientation.lock('landscape') } catch { }
        }
      } catch (err) {
        console.error('Não foi possível entrar em tela cheia:', err)
      }
    } else {
      if (screen.orientation?.unlock) {
        try { screen.orientation.unlock() } catch { }
      }
      await document.exitFullscreen()
    }
  }, [])

  // ─── Movimento ───
  const destinoEhValido = useCallback((destKey) => {
    if (!selectedKey) return false
    if (destKey === '0,0') return false
    if (destKey === selectedKey) return false
    if (posicoes[destKey]) return false
    if (satelites[destKey]) return false

    const edSendo = edificioPorId.get(posicoes[selectedKey])
    if (!edSendo) return false

    if (edSendo.ehCluster) {
      const gridKeys = new Set(Array.from(hexMap.keys()))
      const ocupadasSemEle = new Set(['0,0'])

      Object.entries(posicoes).forEach(([k, id]) => {
        if (k === selectedKey) return
        ocupadasSemEle.add(k)
        const ed = edificioPorId.get(id)
        if (ed?.ehCluster) {
          const [q, r] = k.split(',').map(Number)
          vizinhosDeHex(q, r).forEach((vk) => ocupadasSemEle.add(vk))
        }
      })

      Object.keys(satelites).forEach((k) => {
        if (k !== selectedKey) ocupadasSemEle.add(k)
      })

      const [dq, dr] = destKey.split(',').map(Number)
      return vizinhosDeHex(dq, dr).every(
        (vk) => !ocupadasSemEle.has(vk) && gridKeys.has(vk)
      )
    }

    return true
  }, [selectedKey, posicoes, satelites, edificioPorId, hexMap])

  const moverEdificio = useCallback((destKey) => {
    if (!destinoEhValido(destKey)) return false
    const cartaId = posicoes[selectedKey]
    if (!cartaId) return false

    // Persiste na store (o hook vai re-sincronizar)
    posicionarCarta(cartaId, destKey)

    setSelectedKey(destKey)
    setMoveMode(false)
    setHoveredKey(null)
    return true
  }, [selectedKey, posicoes, destinoEhValido,
    posicionarCarta
  ])

  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`
    if (moveMode) {
      moverEdificio(key)
      return
    }
    if (posicoes[key]) {
      setSelectedKey((prev) => (prev === key ? null : key))
    } else {
      setSelectedKey(null)
    }
  }, [moveMode, posicoes, moverEdificio])

  const handleHover = useCallback((key, isOver) => {
    setHoveredKey(isOver ? key : null)
  }, [])

  const ativarMoveMode = useCallback(() => {
    if (!document.fullscreenElement) return
    if (!selectedKey) return
    setMoveMode(true)
  }, [selectedKey])

  const cancelarMoveMode = useCallback(() => {
    setMoveMode(false)
    setHoveredKey(null)
  }, [])

  const fecharPainel = useCallback(() => {
    setSelectedKey(null)
    setMoveMode(false)
  }, [])





  const tilesToRender = useMemo(() => {
    return hexGrid
      .map((h) => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])



  return (
    <div className="h-screen">
      <MapWorld
        // porte={porte}
        edificiosAtivos={edificiosAtivos}
        posicoes={posicoes}

        satelites={satelites}
        tilesToRender={tilesToRender}
        hexMap={hexMap}
        edificioPorId={edificioPorId}
        selectedKey={selectedKey}
        moveMode={moveMode}
        hoveredKey={hoveredKey}
        isFullscreen={isFullscreen}
        onHexClick={handleHexClick}
        onHover={handleHover}
        onMover={ativarMoveMode}
        onCancelarMove={cancelarMoveMode}
        onFecharPainel={fecharPainel}
        onMapReady={handleMapReady}

        // 🔥 Câmera da Cidade
        cameraPosition={[-3.5, -5, -3.5]}
        cameraFov={35}
        cameraTarget={[0, 0, 0]}
        minDistance={3}
        maxDistance={22}
        autoRotate={true}
        dayProgress={0.4} />
    </div>
  )



}