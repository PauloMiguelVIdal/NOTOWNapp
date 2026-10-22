
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


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
  diretorio: {
    diretorioSelecionado: false,
    enderecoDiretorio:null
  },
}

// ============================================================
// STORE
// ============================================================

export const useNotownStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      selecionarDiretorio: () => set((s) => ({ diretorio: { ...s.diretorio, diretorioSelecionado: true } })),
      setArquivosMap: (map) => set( {arquivosMap:map}),
      setModalDiretory: (valor) => set({modalDiretory:valor}),
      selecionarEnderecoDiretorio: (valor) => set((s) => ({ diretorio: { ...s.diretorio, enderecoDiretorio:valor  } })),
    }),
    {
      name: 'notown-storage',
      version: 4,
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        cidade: state.cidade,
      }),

      migrate: (persisted) => {
        if (!persisted) return persisted
        return persisted
      },


    }
  )
)