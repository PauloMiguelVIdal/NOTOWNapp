import MapWorld from './components/MapWorldCity'
import { GraphicsConfigProvider } from './components/GraphicsConfigContext'
import './App.css'
import Central from './components/Central'


function App() {


  return (
    <>
      <section className='h-screen'>
        <GraphicsConfigProvider>
          <Central>

          </Central>
        </GraphicsConfigProvider>

      </section>



    </>
  )
}

export default App
