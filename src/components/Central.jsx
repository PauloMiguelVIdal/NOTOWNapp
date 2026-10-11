import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"

import MapWorld from "./MapWorldCity"

import { defineHex, Grid, spiral } from 'honeycomb-grid'
import { useNotownStore } from "../store/notownStore"

// ─────────────────────────────────────────────────────────────
//  Gera um prédio com N andares e 2..5 apartamentos por andar
// ─────────────────────────────────────────────────────────────
function gerarPredio({ nome, andares, arquivosBase = [] }) {
  const id = `${nome}-${andares}`

  const listaAndares = Array.from({ length: andares }, (_, i) => {
    const numeroAndar = i + 1
    const qtdApartamentos = 2 + ((i * 7 + nome.length) % 4)

    const apartamentos = Array.from({ length: qtdApartamentos }, (_, j) => {
      const base = arquivosBase[(i + j) % Math.max(arquivosBase.length, 1)] ?? `${nome.toLowerCase()}-${numeroAndar}-${j + 1}`
      const extensao = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'][(i + j) % 6]
      const nomeArquivo = `${base}${extensao}`
      const status = ['livre', 'ativo', 'manutencao'][(i * 3 + j) % 3]

      return {
        id: `${id}-andar${numeroAndar}-apt${j + 1}`,
        numero: `${numeroAndar}${String(j + 1).padStart(2, '0')}`,
        arquivo: nomeArquivo,
        status,
      }
    })

    return {
      id: `${id}-andar${numeroAndar}`,
      numero: numeroAndar,
      apartamentos,
    }
  })

  return { id, nome, andares: listaAndares }
}

// ─────────────────────────────────────────────────────────────
//  Fachada 2D de um apartamento — porta + janela
// ─────────────────────────────────────────────────────────────
function ApartamentoFachada({ apt, selecionado, onClick }) {
  const portaCor =
    apt.status === 'ativo'      ? 'bg-emerald-500/70 border-emerald-300/60' :
    apt.status === 'manutencao' ? 'bg-amber-500/70 border-amber-300/60'     :
                                  'bg-neutral-700 border-neutral-500/60'

  const janelaCor =
    apt.status === 'ativo'      ? 'bg-emerald-200/80' :
    apt.status === 'manutencao' ? 'bg-amber-200/80'   :
                                  'bg-sky-200/60'

  return (
    <button
      onClick={onClick}
      title={apt.arquivo}
      className={[
        "relative flex-1 min-w-0 h-16 rounded-md border transition-all overflow-hidden group",
        selecionado
          ? "border-indigo-400 shadow-[0_0_0_2px_rgba(129,140,248,0.35)]"
          : "border-white/10 hover:border-white/30",
        "bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
      ].join(' ')}
    >
      <div className="absolute top-1 left-1 right-1 flex justify-center">
        <span className="text-[10px] font-semibold text-white/70 tabular-nums tracking-wider">
          {apt.numero}
        </span>
      </div>

      <div className="absolute bottom-1.5 left-0 right-0 flex items-end justify-center gap-1.5 px-2">
        <span className={`w-3 h-3 rounded-[2px] ${janelaCor} border border-black/20 shadow-inner`} />
        <span className={`w-4 h-5 rounded-t-[3px] ${portaCor} border border-black/30 shadow-inner relative`}>
          <span className="absolute right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-[2px] rounded-full bg-yellow-200/80" />
        </span>
      </div>

      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </button>
  )
}

export default function Central() {

  const [selectedKey, setSelectedKey] = useState(null)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const larguraMapa = isSidebarOpen ? '60%' : '100%'

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

  const predios = useMemo(() => ([
    gerarPredio({
      nome: 'Node',
      andares: 25,
      arquivosBase: ['server', 'index', 'router', 'controller', 'middleware'],
    }),
    gerarPredio({
      nome: 'React',
      andares: 25,
      arquivosBase: ['App', 'Main', 'Header', 'Footer', 'Sidebar'],
    }),
    gerarPredio({
      nome: 'PredioCompleto',
      andares: 25,
      arquivosBase: ['Bootstrap', 'Manifest', 'Config', 'Env', 'Readme'],
    }),
  ]), [])

  const [predioSelecionadoId, setPredioSelecionadoId] = useState(predios[0]?.id ?? null)

  const predioAtivo = useMemo(
    () => predios.find(p => p.id === predioSelecionadoId) ?? predios[0],
    [predios, predioSelecionadoId]
  )

  const [andarAbertoId, setAndarAbertoId] = useState(null)
  const [apartamentoSelecionadoId, setApartamentoSelecionadoId] = useState(null)

  const handleToggleAndar = useCallback((andarId) => {
    setAndarAbertoId(prev => prev === andarId ? null : andarId)
    setApartamentoSelecionadoId(null)
  }, [])

  const handleSelecionarApartamento = useCallback((aptId) => {
    setApartamentoSelecionadoId(prev => prev === aptId ? null : aptId)
  }, [])

  // ─── Configuração do grid de hexágonos (mapa) ───
  const pastasArquivos = [
    { nome: 'Node', quantidade: 2 },
    { nome: 'React', quantidade: 2 },
    { nome: 'PredioCompleto', quantidade: 1 },
  ]

  const edificiosAtivos = useMemo(() => {
    return pastasArquivos?.map((pasta, i) =>
      ({
        id: `${pasta.nome}-${i}`,
        nome: pasta.nome,
        setor: 'tecnologia',
        quantidade: pasta.quantidade,
      })
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
        setIsSidebarOpen(false)
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

    posicionarCarta(cartaId, destKey)

    setSelectedKey(destKey)
    setMoveMode(false)
    setHoveredKey(null)
    return true
  }, [selectedKey, posicoes, destinoEhValido, posicionarCarta])

  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`
    if (moveMode) {
      moverEdificio(key)
      return
    }
    if (posicoes[key]) {
      setSelectedKey((prev) => (prev === key ? null : key))
      setIsSidebarOpen(true)
    } else {
      setSelectedKey(null)
      setIsSidebarOpen(false)
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
    setIsSidebarOpen(false)
  }, [])

  const tilesToRender = useMemo(() => {
    return hexGrid
      .map((h) => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  const easingLayout = [0.22, 1, 0.36, 1]

  const apartamentoSelecionado = useMemo(() => {
    if (!apartamentoSelecionadoId || !predioAtivo) return null
    for (const andar of predioAtivo.andares) {
      const apt = andar.apartamentos.find(a => a.id === apartamentoSelecionadoId)
      if (apt) return { ...apt, andar: andar.numero }
    }
    return null
  }, [apartamentoSelecionadoId, predioAtivo])

  return (
    <div className="h-screen w-full flex overflow-hidden bg-neutral-950">

      <motion.div
        layout
        animate={{ width: larguraMapa }}
        transition={{ duration: 0.5, ease: easingLayout }}
        className="relative h-full min-w-0"
        style={{ willChange: 'width' }}
      >
        <MapWorld
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
          isSidebarOpen={isSidebarOpen}
          onHexClick={handleHexClick}
          onHover={handleHover}
          onMover={ativarMoveMode}
          onCancelarMove={cancelarMoveMode}
          onFecharPainel={fecharPainel}
          onMapReady={handleMapReady}

          cameraPosition={[-3.5, -5, -3.5]}
          cameraFov={35}
          cameraTarget={[0, 0, 0]}
          minDistance={3}
          maxDistance={22}
          autoRotate={true}
          dayProgress={0.4}
        />
      </motion.div>

      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? '40%' : '0%',
          opacity: isSidebarOpen ? 1 : 0,
        }}
        transition={{
          width:   { duration: 0.5, ease: easingLayout },
          opacity: { duration: 0.35, ease: 'easeOut' },
        }}
        className="h-full overflow-hidden bg-neutral-900/95 backdrop-blur-md border-l border-white/10"
        style={{ willChange: 'width, opacity' }}
      >
        <div className="h-full w-full flex flex-col">

          {/* ─── Cabeçalho ─── */}
          <div className="p-4 border-b border-white/10 shrink-0">
            <h2 className="text-white text-lg font-semibold mb-3">
              Painel do Edifício
            </h2>

            <div className="flex gap-2 flex-wrap">
              {predios.map((p) => {
                const ativo = p.id === predioAtivo?.id
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPredioSelecionadoId(p.id)
                      setAndarAbertoId(null)
                      setApartamentoSelecionadoId(null)
                    }}
                    className={[
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      ativo
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90",
                    ].join(' ')}
                  >
                    {p.nome}
                  </button>
                )
              })}
            </div>

            <p className="text-white/40 text-[11px] mt-3">
              {predioAtivo?.andares.length} andares · 2 a 5 arquivos por andar
            </p>
          </div>

          {/* ─── Lista de andares ─── */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col-reverse gap-1.5">
              <AnimatePresence initial={false}>
                {predioAtivo?.andares.map((andar) => {
                  const aberto = andarAbertoId === andar.id
                  return (
                    <motion.div
                      key={andar.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: easingLayout }}
                      className={[
                        "rounded-lg border transition-colors overflow-hidden",
                        aberto
                          ? "bg-indigo-500/10 border-indigo-400/40"
                          : "bg-white/5 border-white/10 hover:border-white/20",
                      ].join(' ')}
                    >
                      {/* Linha do andar — só o número, sem barra de janelinhas */}
                      <button
                        onClick={() => handleToggleAndar(andar.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left"
                      >
                        <span className={[
                          "shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-xs font-bold",
                          aberto
                            ? "bg-indigo-500 text-white"
                            : "bg-white/10 text-white/70",
                        ].join(' ')}>
                          {andar.numero}
                        </span>

                        <span className="flex-1 text-white/50 text-[11px]">
                          Andar {andar.numero}
                        </span>

                        <span className="shrink-0 text-[10px] text-white/40 tabular-nums">
                          {andar.apartamentos.length} apts
                        </span>
                      </button>

                      {/* Fachada dos apartamentos + lista de arquivos abaixo */}
                      <AnimatePresence initial={false}>
                        {aberto && (
                          <motion.div
                            key="apts"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: easingLayout }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-2 space-y-2">

                              {/* Fachadas (porta + janela) */}
                              <div className="flex gap-2 rounded-md bg-neutral-950/60 border border-white/5 p-2">
                                {andar.apartamentos.map((apt) => (
                                  <ApartamentoFachada
                                    key={apt.id}
                                    apt={apt}
                                    selecionado={apartamentoSelecionadoId === apt.id}
                                    onClick={() => handleSelecionarApartamento(apt.id)}
                                  />
                                ))}
                              </div>

                              {/* Lista dos arquivos abaixo */}
                              <ul className="flex flex-col gap-1">
                                {andar.apartamentos.map((apt) => {
                                  const sel = apartamentoSelecionadoId === apt.id
                                  return (
                                    <li key={apt.id}>
                                      <button
                                        onClick={() => handleSelecionarApartamento(apt.id)}
                                        className={[
                                          "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left text-[11px] transition-colors",
                                          sel
                                            ? "bg-indigo-500/20 text-white"
                                            : "text-white/60 hover:bg-white/5 hover:text-white/90",
                                        ].join(' ')}
                                      >
                                        <span className="flex items-center gap-2 min-w-0">
                                          <span className="shrink-0 w-6 text-white/40 tabular-nums">
                                            {apt.numero}
                                          </span>
                                          <span className="truncate font-mono">
                                            {apt.arquivo}
                                          </span>
                                        </span>
                                        <span className={[
                                          "shrink-0 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide",
                                          apt.status === 'ativo'      ? 'bg-emerald-400/20 text-emerald-300' :
                                          apt.status === 'manutencao' ? 'bg-amber-400/20 text-amber-300'     :
                                                                        'bg-white/10 text-white/50',
                                        ].join(' ')}>
                                          {apt.status}
                                        </span>
                                      </button>
                                    </li>
                                  )
                                })}
                              </ul>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Rodapé ─── */}
          <div className="p-4 border-t border-white/10 shrink-0">
            {apartamentoSelecionado ? (
              <div className="text-xs">
                <div className="text-white/40 text-[10px] uppercase tracking-wide">
                  Arquivo selecionado
                </div>
                <div className="text-white font-medium truncate font-mono">
                  {apartamentoSelecionado.arquivo}
                </div>
                <div className="text-white/40 text-[10px] mt-1">
                  Andar {apartamentoSelecionado.andar} · Apt {apartamentoSelecionado.numero}
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-xs">
                Nenhum arquivo selecionado
              </p>
            )}
            <p className="text-white/30 text-[10px] mt-1">
              Hex: {selectedKey ?? '—'}
            </p>
          </div>

        </div>
      </motion.aside>

    </div>
  )
}