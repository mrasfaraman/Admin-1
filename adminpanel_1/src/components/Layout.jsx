import React from 'react'
import '../components/Layout.scss'
import Sidebar from './pages/Sidebar/Sidebar'
import Navbar from './pages/Navbar/Navbar'

const Layout = ({ children }) => {
  return (
    <div className='layout'>
      <Sidebar />
      <div className='content'>
        <Navbar />
        {children}
      </div>
    </div>
  )
}

export default Layout
