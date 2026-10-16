import Central from "../components/Central";
import logoExtendida from '../../public/img/logo extendida svg.svg'

import { LucideStar, MousePointerClick, LucideFolderCog } from "lucide-react";
// import logoExtendidaPng from '../../public/img/logo extendida.png'
import linkedin from '../../public/img/icon/linkedin.png'
import github from '../../public/img/icon/github.png'

export default function LandingPage() {
    return (
        <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-white to-[#8F5ADA] flex-col ">
            <img className="w-[1000px] relative right-[40px]" src={logoExtendida} alt="" />
            <div className="w-[40vw] h-[40vh] ">
                <Central />
            </div>
            <p
                className="text-[30px] mt-[10px] font-bold Inter text-[#F27405]"
            //   style={{ fontFamily: "Inter, sans-serif" }}
            >
                SUAS PASTAS EM FORMATO DE CIDADE
            </p>
            <div className="flex  bg-[#350973] w-[40vw] rounded-xl justify-around p-2 gap-2 h-[20vh]">
                <div className="w-3/5 h-full rounded-xl gap-2 flex flex-col">
                    <button className="w-full flex items-center gap-2 p-2 h-[39%] rounded-xl bg-gradient-to-br from-[#F27405] cursor-pointer hover:scale-[1.01] to-orage-600 hover:bg-[#6411D9] transition-300">

                        <div className="cursor-pointer aspect-square h-[80%] bg-gradient-to-br from-[#6411D9] to-[#8F5ADA/10] rounded-xl flex items-center justify-center  ">
                            <LucideFolderCog className="w-[80%] aspect-square" src={github} alt="" />
                        </div>
                        <h2 style={{ fontFamily: "Inter, sans-serif" }} className="Inter font-bold text-[40px] text-center w-full text-white">Selecionar diretório</h2>

                        <h2 />

                        {/* <MousePointerClick className="relative top-10 left-0" size={40} color="white" /> */}
                        {/* <LucideStar className="relative top-10 left-0" size={30} color="white"/> */}
                    </button>
                    <div className="flex flex-col justify-around rounded-xl h-[59%] w-full gap-2 ">

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

                    </div>
                </div>
                <div className="w-2/5 h-full rounded-xl flex flex-col justify-between bg-black">

                    <div className="w-full bg-[#6411D9] flex items-center gap-2 p-2 h-full rounded-xl">

                        <button className="cursor-pointer aspect-square h-[80%] bg-gradient-to-br from-[#6411D9] to-[#8F5ADA] rounded-xl flex items-center justify-center hover:scale-[1.02] transition-300 ">
                            <img className="w-[80%] aspect-square" src={github} alt="" />
                        </button>
                        <p style={{ fontFamily: "Inter, sans-serif" }} className="Inter w-full pl-4 text-white text-[18px]">
                            Contribua com o crescimento do projeto  dando uma estrela!!!
                        </p>

                        <MousePointerClick className="relative top-10 left-0" size={40} color="white" />
                        {/* <LucideStar className="relative top-10 left-0" size={30} color="white"/> */}
                    </div>

                </div>

            </div>
        </div>
    )
}