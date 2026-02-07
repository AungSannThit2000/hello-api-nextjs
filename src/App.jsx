import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import TestAPI from './components/testApi'
import Item from './components/item'
import { Items } from './components/item1'
import { ItemDetail } from './components/itemDetail'
import './App.css'
import RequireAuth from './middleware/RequireAuth'
import Profile from './components/Profile'
import Login from './components/Login'
import Logout from './components/Logout'
import UserList from './components/UserList'

function App() {


  return (
    <Routes>
      <Route path='/test_api' element={<TestAPI />} />
      <Route path='/items' element={<Items />} />
      <Route path='/items/:id' element={<ItemDetail />} />
      <Route path='/login' element={<Login />} />
      <Route path='/profile' element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      <Route path='/logout' element={
        <RequireAuth>
          <Logout />
        </RequireAuth>
      } />
      <Route path='/users' element={<UserList />} />
    </Routes>
  )
}

export default App
