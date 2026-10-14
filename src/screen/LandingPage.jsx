import Central from "../components/Central";
// import logoExtendida from '../../public/img/logo extendida svg'
import logoExtendidaPng from '../../public/img/logo extendida.png'
export default function LandingPage() {
    return (
        <div className="h-screen w-full flex justify-center items-center bg-gradient-to-br from-white to-[#8F5ADA]">
            <div className="w-[40vw] h-[40vh] ">
                <img src={logoExtendidaPng} alt="" />
            <Central />
            </div>
        </div>
    )
}