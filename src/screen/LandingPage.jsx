import Central from "../components/Central";
import logoExtendida from '../../public/img/logo extendida svg.svg'

import { LucideStar, MousePointerClick, LucideFolderCog } from "lucide-react";
// import logoExtendidaPng from '../../public/img/logo extendida.png'
import linkedin from '../../public/img/icon/linkedin.png'
import github from '../../public/img/icon/github.png'
import { useNotownStore } from "../store/notownStore";
import { h1 } from "motion/react-client";
import { useEffect } from "react";
export default function LandingPage() {

   const diretorio = useNotownStore((s) => s.diretorio)
  const diretorioSelecionado = diretorio.diretorioSelecionado == true?alert('opaaa'): alert('teste')   

// useEffect(()=>{
//    diretorio() 
// },[diretorioSelecionado])
    return (
        <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-white to-[#8F5ADA] flex-col ">
            <img className="w-[1000px] relative right-[40px]" src={logoExtendida} alt="" />
            <h2
                className=" relative text-[30px] mt-[10px] font-bold Inter bottom-[50px] text-[#350973]"
                style={{ fontFamily: "Inter, sans-serif" }}
            >
                Transforme suas pastas em uma cidade do conhecimento                {/* suas pastas em formato de cidade */}
            </h2>
            {diretorioSelecionado && (<h1>olá</h1>)}

            <p
                className=" relative text-[25px] font-bold Inter bottom-[50px] text-[#8F5ADA] text-center"
                style={{ fontFamily: "Inter, sans-serif" }}
            >
                Explore seus arquivos em 3D e identifique visualmente <br /> onde estão suas lacunas de aprendizado.                {/* suas pastas em formato de cidade */}
            </p>
            <div className="w-[40vw] h-[40vh] ">
                <Central />
            </div>

            <div className="flex  bg-[#350973] w-[40vw] rounded-xl justify-around p-2 mt-[40px] gap-2 h-[10vh]">
                <div className="w-3/5 h-full rounded-xl gap-2 flex flex-col">
                    <button className="w-full flex items-center gap-2 p-2 h-full rounded-xl bg-gradient-to-br from-[#F27405] cursor-pointer hover:scale-[1.01] to-orage-600 hover:bg-[#6411D9] transition-300">

                        <div className="cursor-pointer aspect-square h-[80%] bg-gradient-to-br from-[#6411D9] to-[#8F5ADA/10] rounded-xl flex items-center justify-center  ">
                            <LucideFolderCog className="w-[80%] aspect-square" src={github} alt="" />
                        </div>
                        <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[40px] text-center w-full text-white">Selecionar diretório</h2>

                        <h2 />

                        {/* <MousePointerClick className="relative top-10 left-0" size={40} color="white" /> */}
                        {/* <LucideStar className="relative top-10 left-0" size={30} color="white"/> */}
                    </button>
                    {/* <div className="flex flex-col justify-around rounded-xl h-[59%] w-full gap-2 ">

                        <div className="w-full h-full flex gap-2 flex-col items-center p-2 ">
                            <button className="flex justify-between items-center w-full h-[45%] bg-gradient-to-br from-[#6411D9] to-[#350973] hover:bg-gradient-to-l hover:from-[#8F5ADA] hover:to-[#6411D9]  rounded-xl hover:scale-[1.01] cursor-pointer">

                                <div className=" aspect-square flex h-full bg-gradient-to-br from-[#6411D9] cursor-pointer to-[#8F5ADA] rounded-xl flex items-center justify-center transition-300 ">
                                    <img className="h-[80%] aspect-square" src={linkedin} alt="" />
                                </div>
                                <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[30px] text-center w-full text-white">PAULO MIGUEL</h2>
                            </button>
                            <button className="flex justify-between items-center w-full h-[45%] bg-gradient-to-br from-[#6411D9] to-[#350973] hover:bg-gradient-to-l hover:from-[#8F5ADA] hover:to-[#6411D9]  rounded-xl hover:scale-[1.01] cursor-pointer">

                                <div className=" aspect-square flex h-full bg-gradient-to-br from-[#6411D9] to-[#8F5ADA] rounded-xl flex items-center justify-center  transition-300 ">
                                    <img className="h-[80%] aspect-square" src={linkedin} alt="" />
                                </div>
                                <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[30px] text-center w-full text-white">Meu Portifólio</h2>
                            </button>
                        </div>

                    </div> */}
                </div>
                <div className="w-2/5 h-full rounded-xl flex flex-col justify-between bg-black">

                    <button className="w-full bg-gradient-to-br from-black to-[#6411D9] flex flex items-center gap-2 p-2 h-full rounded-xl hover:scale-[1.02] transition-300 cursor-pointer">
                        <div className=" bg-[#6411D9] aspect-square h-[100%]  rounded-xl flex items-center justify-center  ">
                            <img className="w-[80%] aspect-square" src={github} alt="" />
                        </div>
                        {/* <div>

                        </div> */}
                        <p style={{ fontFamily: "Inter, sans-serif" }} className="Inter w-full pl-4 text-white font-bold text-[20px]">
                            Contribua com o crescimento do projeto  dando uma estrela!!!
                        </p>

                        {/* <MousePointerClick className="relative top-10 left-0" size={40} color="white" /> */}
                        {/* <LucideStar className="relative top-10 left-0" size={30} color="white"/> */}
                    </button>

                </div>

            </div>
        </div>
    )
}