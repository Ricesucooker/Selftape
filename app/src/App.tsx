import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Studio from './components/RecordingStudio'
import Review from './components/ReviewScreen'
import Uploader from './components/ScriptUploader'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Uploader />}/>
        <Route path='studio' element={<Studio />} />
        <Route path='review' element={<Review />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App