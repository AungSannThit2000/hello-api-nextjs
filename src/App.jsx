import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import TestAPI from './components/testApi'
import Item from './components/item'
import { Items } from './components/item1'
import { ItemDetail } from './components/itemDetail'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/test_api' element={<TestAPI />} />
      <Route path='/items' element={<Items />} />
      <Route path='/items/:id' element={<ItemDetail />} />

    </Routes>
  )
}

export default App
