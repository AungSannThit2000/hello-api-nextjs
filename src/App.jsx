import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import TestAPI from './components/testApi'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/test_api' element={<TestAPI />} />
    </Routes>
  )
}

export default App
