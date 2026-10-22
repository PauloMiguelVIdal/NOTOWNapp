import { useState, useCallback, useMemo, useEffect } from "react"
import { useNotownStore } from "../store/notownStore"
const EXT_PREVIEW = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.css', '.html'])

async function lerDiretorioRecursivo(dirHandle, basePath = "") {
  const arquivos = new Map()

  async function walk(handle, path) {
    for await (const entry of handle.values()) {
      const fullPath = path ? `${path}/${entry.name}` : entry.name

      if (entry.kind === "file") {
        const ext = entry.name.includes(".")
          ? "." + entry.name.split(".").pop().toLowerCase()
          : ""

        arquivos.set(fullPath, {
          handle: entry,
          name: entry.name,
          path: fullPath,
          ext,
          parent: path || "/",
        })
      } else if (entry.kind === "directory") {
        await walk(entry, fullPath)
      }
    }
  }

  await walk(dirHandle, basePath)
  return arquivos
}

export default function ModalDirectory({ onClose, onSelect }) {
  const [dirHandle, setDirHandle] = useState(null)
  const [arquivos, setArquivos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const selecionarDiretorio = useNotownStore((s) => s.selecionarDiretorio)
  const enderecoDiretorio = useNotownStore((s) => s.selecionarEnderecoDiretorio)
  console.log(dirHandle)
  const abrirDiretorio = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      setErro("Navegador não suporta. Use Chrome/Edge em HTTPS ou localhost.")
      return
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: "read" })
      setDirHandle(handle)
      enderecoDiretorio(handle.name)
      setErro(null)
      setLoading(true)

      const map = await lerDiretorioRecursivo(handle)
      setArquivos(map)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      if (err.name === "AbortError") return
      console.error(err)
      setErro(err.message || "Erro ao ler diretório")
    }
  }, [selecionarDiretorio])

  const confirmar = useCallback(() => {
    if (arquivos && onSelect) onSelect(arquivos, dirHandle)
    selecionarDiretorio()
    onSelect?.(arquivos, dirHandle)
    onClose?.()

  }, [arquivos, dirHandle, onSelect, onClose,setArquivos,selecionarDiretorio])

  // Agrupa por pasta pai, filtrando por extensões relevantes
  const pastas = useMemo(() => {
    if (!arquivos) return []
    const acc = {}
    for (const f of arquivos.values()) {
      if (f.ext && !EXT_PREVIEW.has(f.ext)) continue
      acc[f.parent] = acc[f.parent] || []
      acc[f.parent].push(f)
    }
    return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b))
  }, [arquivos])

  const totalRelevantes = useMemo(
    () => pastas.reduce((s, [, l]) => s + l.length, 0),
    [pastas]
  )

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex justify-between h-[70vh] w-[70vw] max-w-[900px] flex-col gap-4 overflow-hidden rounded-lg bg-[#350973] p-6 text-white z-[99999]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between z-[10000]">
          <h2 className="text-lg font-semibold">Selecionar diretório</h2>
          <button
            onClick={onClose}
            className="rounded px-3 py-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={abrirDiretorio}
            className="rounded-md bg-[#6411D9] px-4 py-2 hover:bg-[#7a2ae8]"
          >
            {dirHandle ? "Trocar diretório" : "Abrir diretório"}
          </button>

          {dirHandle && (
            <span className="font-mono text-xs text-white/60">
              📁 {dirHandle.name}
              {arquivos && ` · ${totalRelevantes} arquivos relevantes`}
            </span>
          )}
        </div>

        {loading && <p className="text-sm text-white/60">Lendo arquivos…</p>}
        {erro && <p className="text-sm text-red-400">{erro}</p>}

        {arquivos && (
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-white/10 bg-black/30 p-3">
            {pastas.length === 0 ? (
              <p className="text-sm text-white/40">
                Nenhum arquivo com extensão suportada encontrado.
              </p>
            ) : (
              pastas.map(([pasta, lista]) => (
                <div key={pasta} className="mb-3">
                  <div className="mb-1 font-mono text-[11px] font-semibold text-[#A67BF5]">
                    📂 {pasta} <span className="text-white/30">({lista.length})</span>
                  </div>
                  <ul className="ml-3 flex flex-col gap-0.5">
                    {lista.slice(0, 30).map((f) => (
                      <li
                        key={f.path}
                        className="truncate font-mono text-[11px] text-white/60"
                        title={f.path}
                      >
                        📄 {f.name}
                      </li>
                    ))}
                    {lista.length > 30 && (
                      <li className="text-[10px] italic text-white/30">
                        + {lista.length - 30} arquivos…
                      </li>
                    )}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end gap-2  border-t border-white/10 pt-3">
          <button
            onClick={onClose}
            className="rounded-md bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={!arquivos || totalRelevantes === 0}
            className="rounded-md bg-[#F27405] px-4 py-2 font-medium hover:bg-[#ff8a1f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Usar este diretório
          </button>
        </div>
      </div>
    </div>
  )
}