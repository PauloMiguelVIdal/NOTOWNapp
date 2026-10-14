import MapWorld from './components/MapWorldCity'
import { GraphicsConfigProvider } from './components/GraphicsConfigContext'
import './App.css'
import Central from './components/Central'
import HomeSreen from './screen/HomeScreen'
import LandingPage from './screen/LandingPage'
function App() {


  return (
    <>
      <section className='h-screen'>
        <GraphicsConfigProvider>
          {/* <Central>
          </Central> */}
          {/* <HomeSreen/> */}
          <LandingPage/>
        </GraphicsConfigProvider>

      </section>



    </>
  )
}

export default App
