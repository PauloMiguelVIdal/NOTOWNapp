
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  CARTAS_CATALOGO,
  RARIDADES_CONFIG,
  MULTIPLICADORES_NIVEL,
} from '../data/cartas'


// ============================================================
// HELPERS INTERNOS
// ============================================================

const gerarId = (prefixo) =>
  `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const proximoMes = (mes) => {
  const [ano, m] = mes.split('-').map(Number)
  const d = new Date(ano, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const diasNoMes = (mesStr) => {
  const [ano, mes] = mesStr.split('-').map(Number)
  return new Date(ano, mes, 0).getDate()
}

// ============================================================
// ESTADO INICIAL
// ============================================================

const initialState = {
  user: {
    id: null,
    username: '',
    nome: '',
    avatarUrl: null,
    criadoEm: null,
  },

  
  cartasNovas: {}, // { [cartaId]: true }

  progressao: {
    xp: 0,
    sequenciaDias: 0,
    ultimaAtividadeEm: null,
  },


  inventario: {
    cartas: {},
  },

  cidade: {
    temporadaAtualId: null,
    ultimaViradaProcessada: null,
    nivel: 1,
    porte: 'Micro Empresa',
    raio: 3,
    atividadesMes: 0,
    nivelExpandido: 1,
    posicoesPatrimonio: {},
    temporadas: {},
  },
  ui: {
    modalAtividadeAberto: false,
    modalLojaAberto: false,
    modalViradaDeMes: null,
    cartaExpandidaId: null,
    loading: false,
    erro: null,
  },

  catalogo: {
    cartas: CARTAS_CATALOGO,

    raridades: RARIDADES_CONFIG,
    multiplicadores: MULTIPLICADORES_NIVEL,
    config: {
      metaDiariaKcal: 600,
      metaSemanalTreinos: 5,
      metaMensalAtividades: 16,
      moedasPorColeta: 0.19,
    },
  },
}

// ============================================================
// STORE
// ============================================================

export const useNotownStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ═══════════════════════════════════════════════════════
      // 1. USUÁRIO
      // ═══════════════════════════════════════════════════════

      setUser: (user) => set((state) => ({
        user: {
          ...state.user,
          ...user,
          criadoEm: state.user.criadoEm || new Date().toISOString(),
        },
      })),

      clearUser: () => set(() => ({
        user: initialState.user,
       
        inventario: initialState.inventario,
        cidade: initialState.cidade,

        cartasNovas: {},
      })),

      

      // ═══════════════════════════════════════════════════════
      // 4. INVENTÁRIO
      // ═══════════════════════════════════════════════════════

      adicionarCarta: (cartaId, quantidade = 1) => set((s) => {
        const atual = s.inventario.cartas[cartaId] || { cartaId, quantidade: 0 }
        const eraNova = atual.quantidade === 0
        return {
          inventario: {
            ...s.inventario,
            cartas: {
              ...s.inventario.cartas,
              [cartaId]: { ...atual, quantidade: atual.quantidade + quantidade },
            },
          },
          notificacoes: eraNova
            ? { ...s.notificacoes, inventario: true }
            : s.notificacoes,
          cartasNovas: eraNova
            ? { ...s.cartasNovas, [cartaId]: true }
            : s.cartasNovas,
        }
      }),

      marcarCartaVista: (cartaId) => set((s) => {
        if (!s.cartasNovas?.[cartaId]) return s
        const novas = { ...s.cartasNovas }
        delete novas[cartaId]
        return { cartasNovas: novas }
      }),

      limparCartasNovas: () => set(() => ({ cartasNovas: {} })),

      removerCarta: (cartaId, quantidade = 1) => set((s) => {
        const atual = s.inventario.cartas[cartaId]
        if (!atual) return s

        const novaQtd = Math.max(0, atual.quantidade - quantidade)
        const novasCartas = { ...s.inventario.cartas }

        if (novaQtd === 0) {
          delete novasCartas[cartaId]
        } else {
          novasCartas[cartaId] = { ...atual, quantidade: novaQtd }
        }

        return { inventario: { ...s.inventario, cartas: novasCartas } }
      }),

      // ═══════════════════════════════════════════════════════
      // 6. FLUXO A — CIDADE PATRIMÔNIO
      // ═══════════════════════════════════════════════════════

      posicionarCartaPatrimonio: (cartaId, hexKey) => set((s) => {
        const posicoes = { ...s.cidade.posicoesPatrimonio }
        Object.keys(posicoes).forEach((key) => {
          if (posicoes[key] === cartaId) delete posicoes[key]
        })
        posicoes[hexKey] = cartaId
        return { cidade: { ...s.cidade, posicoesPatrimonio: posicoes } }
      }),

      removerCartaPatrimonio: (cartaId) => set((s) => {
        const posicoes = { ...s.cidade.posicoesPatrimonio }
        Object.keys(posicoes).forEach((key) => {
          if (posicoes[key] === cartaId) delete posicoes[key]
        })
        return { cidade: { ...s.cidade, posicoesPatrimonio: posicoes } }
      }),

      // ═══════════════════════════════════════════════════════
      // 7. FLUXO B — CIDADE PROGRESSO
      // ═══════════════════════════════════════════════════════

      moverEdificioProgresso: (edificioId, novoHexKey) => set((s) => {
        const temporadaId = s.cidade.temporadaAtualId
        const temp = s.cidade.temporadas[temporadaId]
        if (!temp) return s

        const edificio = temp.edificiosAtivos[edificioId]
        if (!edificio) return s

        return {
          cidade: {
            ...s.cidade,
            temporadas: {
              ...s.cidade.temporadas,
              [temporadaId]: {
                ...temp,
                edificiosAtivos: {
                  ...temp.edificiosAtivos,
                  [edificioId]: { ...edificio, hexKey: novoHexKey },
                },
              },
            },
          },
        }
      }),

      expandirMundo: () => set((s) => ({
        cidade: { ...s.cidade, nivelExpandido: s.cidade.nivel },
      })),

      

      // ═══════════════════════════════════════════════════════
      // 9. UI
      // ═══════════════════════════════════════════════════════

      abrirModalAtividade: () => set((s) => ({ ui: { ...s.ui, modalAtividadeAberto: true } })),
      fecharModalAtividade: () => set((s) => ({ ui: { ...s.ui, modalAtividadeAberto: false } })),

      abrirModalLoja: () => set((s) => ({ ui: { ...s.ui, modalLojaAberto: true } })),
      fecharModalLoja: () => set((s) => ({ ui: { ...s.ui, modalLojaAberto: false } })),

      fecharModalViradaDeMes: () => set((s) => ({ ui: { ...s.ui, modalViradaDeMes: null } })),

      setCartaExpandida: (cartaId) => set((s) => ({ ui: { ...s.ui, cartaExpandidaId: cartaId } })),

      setLoading: (loading) => set((s) => ({ ui: { ...s.ui, loading } })),
      setErro: (erro) => set((s) => ({ ui: { ...s.ui, erro } })),

     



    }),
    {
      name: 'fitcity-storage',
      version: 4, // ⬅️ bump para forçar migrate
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,

        
        inventario: state.inventario,
        cidade: state.cidade,


      }),

      migrate: (persisted) => {
        if (!persisted) return persisted

        if (persisted.cidade) {
          delete persisted.cidade.pacoteVisualAtivo
          delete persisted.cidade.pacotesVisuaisDesbloqueados
        }





        return persisted
      },

      onRehydrateStorage: () => (state) => {
        if (state) state.verificarViradaDeMes()
      },
    }
  )
)