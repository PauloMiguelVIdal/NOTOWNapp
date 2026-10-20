import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { motion } from "motion/react"

import MapWorld from "./MapWorldCity"
import { EDIFICIO_PARA_MODELO, MODELOS } from "./BuildingModels"
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import { useNotownStore } from "../store/notownStore"
import ModalDirectory from "./modalDiretory"
import { LucideFolderCog } from "lucide-react"

// ─────────────────────────────────────────────────────────────
//  Constantes
// ─────────────────────────────────────────────────────────────
const STATUS = {
  dominado:   { label: 'Dominado',   cor: '#6411D9' },
  aprendendo: { label: 'Aprendendo', cor: '#A67BF5' },
  novo:       { label: 'Novo',       cor: 'rgba(255,255,255,0.22)' },
  revisar:    { label: 'Revisar',    cor: '#F27405' },
}
const ORDEM_STATUS = ['dominado', 'aprendendo', 'novo', 'revisar']
const ALTUAR_MAX_PREDIO = 15
const COLS = 5

// Extensões que viram "andares"
const EXT_VALIDAS = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.html'])

// Vizinhos axiais de um hex
const HEX_DIRECTIONS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

// ─────────────────────────────────────────────────────────────
//  Largura responsiva da sidebar
// ─────────────────────────────────────────────────────────────
const calcSidebarW = () =>
  typeof window === 'undefined'
    ? 820
    : Math.max(630, Math.min(Math.round(window.innerWidth * 0.25), 920))

function useSidebarWidth() {
  const [w, setW] = useState(calcSidebarW)
  useEffect(() => {
    const onResize = () => setW(calcSidebarW())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return w
}

// ─────────────────────────────────────────────────────────────
//  Dados
// ─────────────────────────────────────────────────────────────
function calcStats(cards) {
  const s = { total: cards.length, dominado: 0, aprendendo: 0, novo: 0, revisar: 0 }
  cards.forEach(c => { s[c.status]++ })
  s.pct = s.total ? Math.round((s.dominado / s.total) * 100) : 0
  return s
}

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// ─────────────────────────────────────────────────────────────
//  Gera um prédio a partir de uma pasta real de arquivos
//  1 arquivo = 1 andar
//  - andares           → TODOS (interface 2D / análise)
//  - andaresLimitados  → top ALTUAR_MAX_PREDIO (mapa 3D)
//  - excedentes        → quantos arquivos ficaram de fora do 3D
// ─────────────────────────────────────────────────────────────
function gerarPredioDeArquivos({ nome, arquivos }) {
  const id = `predio-${nome}`

  // 🔥 gera UMA vez todos os andares
  const todosAndares = arquivos.map((fileInfo, i) => {
    const numero = i + 1
    const seed = hashStr(fileInfo.path)
    const qtd = 2 + (seed % 4)

    const cards = Array.from({ length: qtd }, (_, j) => {
      const cardSeed = hashStr(`${fileInfo.path}-${j}`)
      return {
        id: `${id}-andar${numero}-card${j + 1}`,
        numero: `${numero}${String(j + 1).padStart(2, '0')}`,
        pergunta: `Flashcard ${j + 1} · ${fileInfo.name}`,
        status: ORDEM_STATUS[cardSeed % 4],
      }
    })

    return {
      id: `${id}-andar${numero}`,
      numero,
      arquivo: fileInfo.name,
      caminho: fileInfo.path,
      apartamentos: cards,
      stats: calcStats(cards),
    }
  })

  const andaresLimitados = todosAndares.slice(0, ALTUAR_MAX_PREDIO)
  const excedentes = Math.max(0, todosAndares.length - ALTUAR_MAX_PREDIO)

  return {
    id,
    nome,
    andares: todosAndares,                 // 2D vê tudo
    andaresLimitados,                      // 3D vê só o topo
    excedentes,                            // quantos ficaram de fora do 3D
    stats: calcStats(todosAndares.flatMap(a => a.apartamentos)),
  }
}

function gerarPredioFake({ nome, andares }) {
  const id = `fake-${nome}`
  const total = andares
  const limitados = Math.min(total, ALTUAR_MAX_PREDIO)
  const excedentes = Math.max(0, total - ALTUAR_MAX_PREDIO)

  const todosAndares = Array.from({ length: total }, (_, i) => {
    const numero = i + 1
    const cards = Array.from({ length: 3 }, (_, j) => ({
      id: `${id}-andar${numero}-card${j + 1}`,
      numero: `${numero}${String(j + 1).padStart(2, '0')}`,
      pergunta: `Placeholder ${j + 1} · ${nome}`,
      status: 'novo',
    }))
    return {
      id: `${id}-andar${numero}`,
      numero,
      arquivo: `${nome.toLowerCase()}-${numero}.js`,
      apartamentos: cards,
      stats: calcStats(cards),
    }
  })

  return {
    id,
    nome,
    andares: todosAndares,
    andaresLimitados: todosAndares.slice(0, limitados),
    excedentes,
    stats: calcStats(todosAndares.flatMap(a => a.apartamentos)),
  }
}

// ─────────────────────────────────────────────────────────────
//  Barra empilhada de progresso
// ─────────────────────────────────────────────────────────────
function BarraStatus({ stats, className = 'h-1.5' }) {
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      {ORDEM_STATUS.map(s =>
        stats[s] ? (
          <div key={s} style={{ width: `${(stats[s] / stats.total) * 100}%`, background: STATUS[s].cor }} />
        ) : null
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Janela (apartamento = flashcard)
// ─────────────────────────────────────────────────────────────
function Janela({ apt, selecionado, onClick }) {
  return (
    <button
      onClick={onClick}
      title={`${apt.pergunta} · ${STATUS[apt.status].label}`}
      className={[
        'relative aspect-[5/4] min-w-0 overflow-hidden rounded-md border transition-all',
        selecionado
          ? 'border-[#F27405] shadow-[0_0_0_2px_rgba(242,116,5,0.4)]'
          : 'border-white/10 hover:border-[#6411D9]',
        'bg-white/[0.04]',
      ].join(' ')}
    >
      <span
        className="absolute inset-x-[18%] top-[14%] h-[38%] rounded-[3px] border border-black/20"
        style={{ background: STATUS[apt.status].cor }}
      />
      <span className="absolute bottom-0 left-1/2 h-[30%] w-[26%] -translate-x-1/2 rounded-t-[3px] border border-b-0 border-black/30 bg-[#350973]" />
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
//  Fachada do prédio — 2D mostra TODOS os andares
// ─────────────────────────────────────────────────────────────
function FachadaPredio({ predio, andarAbertoId, aptSelId, onAndar, onApt }) {
  const refs = useRef({})

  useEffect(() => {
    if (andarAbertoId) {
      refs.current[andarAbertoId]?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [andarAbertoId])

  const andaresDeCima = useMemo(() => [...predio.andares].reverse(), [predio])

  return (
    <div className="mx-auto w-full max-w-[460px]">
      {predio.excedentes > 0 && (
        <div className="mb-2 flex items-center gap-1.5 rounded bg-[#F27405]/15 px-2 py-1 text-[11px] text-[#F27405]">
          ⚠ {predio.excedentes} arquivo{predio.excedentes > 1 ? 's' : ''} acima do limite de {ALTUAR_MAX_PREDIO} no mapa 3D
        </div>
      )}

      <div className="mx-auto h-3 w-[96%] rounded-t-md bg-[#6411D9]" />

      <div className="border-x border-[#6411D9]/50 bg-[#1a0640]">
        {andaresDeCima.map(a => {
          const aberto = a.id === andarAbertoId
          return (
            <div
              key={a.id}
              ref={el => { refs.current[a.id] = el }}
              className={[
                'border-b border-white/5 px-2.5 py-2 transition-colors',
                aberto ? 'bg-[#F27405]/10 shadow-[inset_2px_0_0_#F27405]' : '',
              ].join(' ')}
            >
              <button
                onClick={() => onAndar(a.id)}
                className="mb-1.5 flex w-full items-center gap-2 text-left"
                title={a.caminho || a.arquivo}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white/70">
                  {a.numero}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/70">
                  {a.arquivo}
                </span>
                {a.stats.revisar > 0 && (
                  <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold tabular-nums text-[#F27405]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#F27405]" />
                    {a.stats.revisar}
                  </span>
                )}
              </button>

              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
              >
                {a.apartamentos.map(apt => (
                  <Janela
                    key={apt.id}
                    apt={apt}
                    selecionado={aptSelId === apt.id}
                    onClick={() => onApt(apt.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex h-8 items-end justify-center border border-t-0 border-[#6411D9]/50 bg-[#1a0640]">
        <div className="h-6 w-8 rounded-t-md bg-[#F27405]/70" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Painel analítico
// ─────────────────────────────────────────────────────────────
function RankList({ titulo, cor, itens, onAbrir }) {
  if (!itens.length) return null
  return (
    <section>
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: cor }}>
        {titulo}
      </h3>
      <ul className="flex flex-col gap-1">
        {itens.map(({ andar, valor, max, rotulo }) => (
          <li key={andar.id}>
            <button
              onClick={() => onAbrir(andar.id)}
              className="group w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-mono text-white/80">{andar.arquivo}</span>
                <span className="shrink-0 tabular-nums" style={{ color: cor }}>{rotulo}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${(valor / max) * 100}%`, background: cor }} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PainelAnalitico({ predios, predioAtivo, onSelecionarPredio, onAbrirAndar, apartamentoSelecionado }) {
  const { prioridade, comecar, fortes } = useMemo(() => {
    const a = predioAtivo?.andares ?? []   // análise usa TODOS os andares
    const top = (arr, n) => arr.slice(0, n)
    const maxRev = Math.max(1, ...a.map(x => x.stats.revisar))
    const maxNovo = Math.max(1, ...a.map(x => x.stats.novo))
    return {
      prioridade: top(
        [...a].filter(x => x.stats.revisar > 0)
          .sort((x, y) => y.stats.revisar - x.stats.revisar || x.stats.pct - y.stats.pct), 6
      ).map(andar => ({ andar, valor: andar.stats.revisar, max: maxRev, rotulo: `${andar.stats.revisar} p/ revisar` })),
      comecar: top(
        [...a].filter(x => x.stats.novo > 0).sort((x, y) => y.stats.novo - x.stats.novo), 4
      ).map(andar => ({ andar, valor: andar.stats.novo, max: maxNovo, rotulo: `${andar.stats.novo} novos` })),
      fortes: top([...a].sort((x, y) => y.stats.pct - x.stats.pct), 4)
        .map(andar => ({ andar, valor: andar.stats.pct, max: 100, rotulo: `${andar.stats.pct}%` })),
    }
  }, [predioAtivo])

  if (!predioAtivo) {
    return (
      <div className="flex h-full w-[320px] shrink-0 items-center justify-center border-r border-[#6411D9]/25 text-sm text-white/40">
        Nenhum diretório carregado
      </div>
    )
  }

  const s = predioAtivo.stats

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col border-r border-[#6411D9]/25">
      <div className="shrink-0 border-b border-[#6411D9]/25 p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {predios.map(p => (
            <button
              key={p.id}
              onClick={() => onSelecionarPredio(p.id)}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                p.id === predioAtivo.id
                  ? 'bg-[#6411D9] text-white'
                  : 'bg-white/5 text-white/55 hover:bg-[#6411D9]/25 hover:text-white',
              ].join(' ')}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#6411D9]/25 p-4">
        {apartamentoSelecionado ? (
          <div className="text-xs">
            <div className="text-[10px] uppercase tracking-wide text-white/35">Flashcard selecionado</div>
            <div className="truncate font-medium text-white">{apartamentoSelecionado.pergunta}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/45">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: STATUS[apartamentoSelecionado.status].cor }} />
              {STATUS[apartamentoSelecionado.status].label}
              <span className="truncate font-mono">· {apartamentoSelecionado.arquivo} · Apt {apartamentoSelecionado.numero}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/35">Nenhum flashcard selecionado</p>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
//  Central
// ═════════════════════════════════════════════════════════════
export default function Central() {
  const [selectedKey, setSelectedKey] = useState(null)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const arquivosMap = useNotownStore((s) => s.arquivosMap)
  const diretorio = useNotownStore((s) => s.diretorio)
  const setArquivosMap = useNotownStore((s) => s.setArquivosMap)
  const diretorioSelecionado = diretorio.diretorioSelecionado
console.log(arquivosMap)
  const SIDEBAR_W = useSidebarWidth()
  const larguraMapa = isSidebarOpen ? `calc(100% - ${SIDEBAR_W}px)` : '100%'

  const posicionarCarta = useNotownStore((s) => s.posicionarCartaPatrimonio)

  // ─── Diretório selecionado ───
  const handleDiretorioSelecionado = useCallback((map) => {
    setArquivosMap(map)
    console.log("Arquivos carregados:", map.size)
  }, [setArquivosMap])

  // ─── Prédios: do diretório real, ou fallback fake ───
  const predios = useMemo(() => {
    if (!arquivosMap || arquivosMap.size === 0) {
      return [
        gerarPredioFake({ nome: 'Node',       andares: 17 }),
        gerarPredioFake({ nome: 'Javascript', andares: 14 }),
        gerarPredioFake({ nome: 'Tailwind',   andares: 12 }),
        gerarPredioFake({ nome: 'Java',       andares: 15 }),
        gerarPredioFake({ nome: 'NextJs',     andares: 11 }),
        gerarPredioFake({ nome: 'NestJs',     andares: 12 }),
        gerarPredioFake({ nome: 'Typescript', andares: 5 }),
        gerarPredioFake({ nome: 'TreeJs',     andares: 7 }),
        gerarPredioFake({ nome: 'Zustand',    andares: 12 }),
        gerarPredioFake({ nome: 'MongoDb',    andares: 4 }),
        gerarPredioFake({ nome: 'MySql',      andares: 1 }),
        gerarPredioFake({ nome: 'Postgres',   andares: 2 }),
        gerarPredioFake({ nome: 'Github',     andares: 5 }),
        gerarPredioFake({ nome: 'RAG',        andares: 13 }),
      ]
    }

    const porPasta = new Map()
    for (const [, info] of arquivosMap) {
      if (info.ext && !EXT_VALIDAS.has(info.ext)) continue

      const partes = info.path.split("/")
      const primeiraPasta = partes.length > 1 ? partes[0] : "(raiz)"

      if (!porPasta.has(primeiraPasta)) porPasta.set(primeiraPasta, [])
      porPasta.get(primeiraPasta).push(info)
    }

    const entradas = Array.from(porPasta.entries())
      .filter(([, arquivos]) => arquivos.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))

    if (entradas.length === 0) {
      return [gerarPredioFake({ nome: 'Vazio', andares: 1 })]
    }

    return entradas.map(([nome, arquivos]) =>
      gerarPredioDeArquivos({ nome, arquivos })
    )
  }, [arquivosMap])

  // ─── Predio ativo: sincroniza automaticamente quando predios muda ───
  const [predioSelecionadoId, setPredioSelecionadoId] = useState(null)
  const [andarAbertoId, setAndarAbertoId] = useState(null)
  const [apartamentoSelecionadoId, setApartamentoSelecionadoId] = useState(null)

  useEffect(() => {
    if (predios.length === 0) return
    const existe = predios.some(p => p.id === predioSelecionadoId)
    if (!existe) {
      setPredioSelecionadoId(predios[0].id)
      setAndarAbertoId(null)
      setApartamentoSelecionadoId(null)
    }
  }, [predios, predioSelecionadoId])

  const predioAtivo = useMemo(
    () => predios.find(p => p.id === predioSelecionadoId) ?? predios[0] ?? null,
    [predios, predioSelecionadoId]
  )

  const handleToggleAndar = useCallback((andarId) => {
    setAndarAbertoId(prev => prev === andarId ? null : andarId)
    setApartamentoSelecionadoId(null)
  }, [])

  const handleSelecionarApartamento = useCallback((aptId) => {
    setApartamentoSelecionadoId(prev => prev === aptId ? null : aptId)
  }, [])

  const handleSelecionarPredio = useCallback((id) => {
    setPredioSelecionadoId(id)
    setAndarAbertoId(null)
    setApartamentoSelecionadoId(null)
  }, [])

  const handleAbrirAndar = useCallback((id) => {
    setAndarAbertoId(id)
    setApartamentoSelecionadoId(null)
  }, [])

  // ─── Edifícios no mapa 3D (usa LIMITADOS) ───
  const edificiosAtivos = useMemo(() => {
    const lista = predios.map((p) => ({
      id: p.id,
      nome: p.nome,
      setor: 'tecnologia',
      quantidade: p.andaresLimitados?.length ?? p.andares.length,   // 🔥 3D respeita o teto
      excedentes: p.excedentes ?? 0,
    }))
    console.log('🏢 edificiosAtivos:', lista)
    return lista
  }, [predios])

  // ─── Grid hexagonal ───
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
  const [mapTimeoutId, setMapTimeoutId] = useState(null)

  const handleMapReady = useCallback(() => {
    const id = setTimeout(() => setMapTimeoutId(id), 400)
  }, [])

  useEffect(() => {
    return () => { if (mapTimeoutId) clearTimeout(mapTimeoutId) }
  }, [mapTimeoutId])

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
      const ed = edificioPorId.get(posicoes[key])
      const predio = predios.find(p => p.id === ed?.id)
      if (predio) {
        setPredioSelecionadoId(predio.id)
        setAndarAbertoId(null)
        setApartamentoSelecionadoId(null)
      }
      setSelectedKey((prev) => (prev === key ? null : key))
      setIsSidebarOpen(true)
    } else {
      setSelectedKey(null)
      setIsSidebarOpen(false)
    }
  }, [moveMode, posicoes, moverEdificio, edificioPorId, predios])

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
      if (apt) return { ...apt, andar: andar.numero, arquivo: andar.arquivo }
    }
    return null
  }, [apartamentoSelecionadoId, predioAtivo])

  return (
    <div className="h-full w-full rounded-2xl flex overflow-hidden bg-neutral-950">
      <motion.div
        animate={{ width: larguraMapa }}
        initial={false}
        transition={{ duration: 0.5, ease: easingLayout }}
        className="relative h-full min-w-0"
        style={{ willChange: 'width' }}
      >
        <MapWorld
          edificiosAtivos={edificiosAtivos}
          posicoes={posicoes}
          satelites={satelites}
          tilesToRender={tilesToRender}
          hexMap={hexMap}          edificioPorId={edificioPorId}
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
          cameraPosition={[15, 15, 15]}
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
        animate={{ width: isSidebarOpen ? SIDEBAR_W : 0, opacity: isSidebarOpen ? 1 : 0 }}
        transition={{
          width: { duration: 0.5, ease: easingLayout },
          opacity: { duration: 0.35, ease: 'easeOut' },
        }}
        className="h-full shrink-0 overflow-hidden border-l border-[#6411D9]/30 bg-[#1a0640]/95 backdrop-blur-md"
      >
        <div className="flex h-full" style={{ width: SIDEBAR_W }}>
          <PainelAnalitico
            predios={predios}
            predioAtivo={predioAtivo}
            onSelecionarPredio={handleSelecionarPredio}
            onAbrirAndar={handleAbrirAndar}
            apartamentoSelecionado={apartamentoSelecionado}
          />

          <div className="flex h-full min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#6411D9]/25 px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-white/35">
                Fachada · {predioAtivo?.nome ?? '—'}
              </div>
              <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                {ORDEM_STATUS.map(k => (
                  <span key={k} className="flex items-center gap-1 text-[10px] text-white/50">
                    <span className="h-2 w-2 rounded-[2px]" style={{ background: STATUS[k].cor }} />
                    {STATUS[k].label}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {predioAtivo && (
                <FachadaPredio
                  predio={predioAtivo}
                  andarAbertoId={andarAbertoId}
                  aptSelId={apartamentoSelecionadoId}
                  onAndar={handleToggleAndar}
                  onApt={handleSelecionarApartamento}
                />
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </div>
  )
}