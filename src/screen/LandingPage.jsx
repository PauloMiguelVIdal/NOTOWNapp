import Central from "../components/Central";
import logoExtendida from '../../public/img/logo extendida svg.svg'
import logo from '../../public/img/icon logo.svg'

import { LucideFolderOpen, LucideMonitor } from "lucide-react";
// import logoExtendidaPng from '../../public/img/logo extendida.png'
import linkedin from '../../public/img/icon/linkedin.png'
import github from '../../public/img/icon/github.png'
import { useNotownStore } from "../store/notownStore";
import { h1 } from "motion/react-client";
import { useEffect, useState, useCallback } from "react";
import ModalDirectory from "../components/modalDiretory";

export default function LandingPage() {


    const diretorio = useNotownStore((s) => s.diretorio)
    const setArquivosMap = useNotownStore((s) => s.setArquivosMap)
    const setModalDiretory = useNotownStore((s) => s.setModalDiretory)



    const modalDiretory = useNotownStore((s) => s.modalDiretory)
    const diretórioSelecionado = diretorio.diretorioSelecionado
    console.log(diretorio.EnderecoDiretorio)
    console.log(diretorio)


    const dimensionMap = diretórioSelecionado === true ? `w-[98vw] h-[94vh]` : `w-[40vw] h-[40vh]`

    const handleDiretorioSelecionado = useCallback((map) => {
        setArquivosMap(map)
        console.log("Arquivos carregados:", map.size)
    }, [])


    return (
        <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-white to-[#8F5ADA] flex-col ">

            {modalDiretory && (
                <ModalDirectory

                    className='relative z-[100000000000000000]'
                    onClose={() => setModalDiretory(false)}
                    onSelect={handleDiretorioSelecionado}
                />
            )}
            {!diretórioSelecionado && (
                <div className="w-full flex justify-center items-center flex-col ">


                    <img className="w-[1000px] relative right-[40px]" src={logoExtendida} alt="" />
                    <h2
                        className=" relative text-[25px] mt-[10px] font-bold Inter bottom-[50px] text-[#6411D9]"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        Transforme suas pastas em uma cidade do conhecimento                {/* suas pastas em formato de cidade */}
                    </h2>


                    <p
                        className=" relative text-[20px] font-bold Inter bottom-[50px] text-[#8F5ADA] text-center"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        Explore seus arquivos em 3D e identifique visualmente <br /> onde estão suas lacunas de aprendizado.                {/* suas pastas em formato de cidade */}
                    </p>
                </div>
            )}
            <div className={`${dimensionMap}`}>

                <Central />
            </div>
            {!diretórioSelecionado && (
                <div className="  rounded-xl h-[5vh] w-[40vw] mt-[15px] flex justify-between">
                    <button onClick={() => setModalDiretory(true)} className="w-[60%]  flex items-center gap-2 h-full rounded-xl bg-gradient-to-r  from-[#8F5ADA] from-5% via-[#6411D9] via-18% to-[#6411D9] to-70% cursor-pointer hover:bg-[#6411D9] transition-300 hover:from-[#6411D9] hover:to-[#350973] border-2 border-[#F27405]">

                        <div className="cursor-pointer aspect-square h-[100%] bg-gradient-to-r from-[#F27405] rounded-xl flex items-center justify-center  ">
                            <LucideFolderOpen color="white" className="h-[100%] aspect-square" src={github} alt="" />
                        </div>
                        <div>

                            <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[30px] text-center w-full text-[#F27405]">Selecionar diretório</h2>

                            <h2 />
                        </div>

                        {/* <MousePointerClick className="relative top-10 left-0" size={40} color="white" /> */}
                        {/* <LucideStar className="relative top-10 left-0" size={30} color="white"/> */}
                    </button>
                    <a href="https://postif-lio.vercel.app/" target="_blank" className="flex justify-between items-center w-[30%] h-full bg-gradient-to-r from-[#8F5ADA] from-5% via-[#6411D9] via-18% to-[#350973] to-70% hover:bg-gradient-to-r hover:from-[#350973] hover:to-black rounded-xl cursor-pointer ">

                        <div className="cursor-pointer aspect-square h-[100%]  rounded-xl flex items-center justify-center  ">
                            <LucideMonitor color="white" className="h-[80%] aspect-square ml-1" alt="" />
                        </div>
                        <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[15px] text-center w-full text-white">Meu Portifólio</h2>

                    </a>
                    <a href="https://www.linkedin.com/in/paulo-miguel-vidal-da-silva/" target="_blank" className="flex justify-between items-center h-full p-2 bg-gradient-to-br from-[#6411D9] to-[#350973] hover:bg-gradient-to-l hover:from-[#8F5ADA] hover:to-[#6411D9]  rounded-xl hover:scale-[1.01] cursor-pointer">

                        {/* <div className=" aspect-square flex h-full bg-gradient-to-br from-[#6411D9] cursor-pointer to-[#8F5ADA] rounded-xl flex items-center justify-center transition-300 "> */}
                        <img className="h-[100%] aspect-square" src={linkedin} alt="" />
                        {/* </div> */}
                        {/* <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[15px] text-center w-full text-white">PAULO MIGUEL</h2> */}
                    </a>

                </div>
            )}

            <div className="fixed rounded-xl flex justify-center items-center bg-gradient-to-br from-[white] to-[#6411D9] bottom-[5vh] left-[2vw] w-[50px] h-[50px]">

                <img className="relative right-2" src={logo} />
            </div>
        </div>
    )
}