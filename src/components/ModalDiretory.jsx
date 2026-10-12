import { useState } from "react"

export default function ModalDirectory({ onClose }) {
  const [dirHandle, setDirHandle] = useState(null)

  async function abrirDiretorio() {
    if (!window.showDirectoryPicker) {
      alert("Navegador não suporta. Use Chrome/Edge em HTTPS ou localhost.")
      return
    }
    try {
      const handle = await window.showDirectoryPicker()
      setDirHandle(handle)
    } catch (err) {
      if (err.name === "AbortError") return
      console.error("Erro:", err)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex w-[40vw] h-[50vh] flex-col items-center justify-center gap-4 rounded-lg bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={abrirDiretorio}
          className="rounded-md bg-[#6411D9] px-4 py-2 text-white hover:bg-[#7a2ae8]"
        >
          Abrir diretório
        </button>

        <input type="file" className="text-white" />

        {dirHandle && (
          <p className="text-white">Diretório: {dirHandle.name}</p>
        )}

        <button
          onClick={onClose}
          className="rounded-md bg-white/10 px-4 py-2 text-white hover:bg-white/20"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}