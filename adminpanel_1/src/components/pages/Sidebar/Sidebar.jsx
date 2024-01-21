import React from 'react'
import './Sidebar.scss'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BookOnlineIcon from '@mui/icons-material/BookOnline'
import GroupIcon from '@mui/icons-material/Group'
import ChatIcon from '@mui/icons-material/Chat'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { Link, useNavigate } from 'react-router-dom'
import logoImage from '../../../Assets/Logo.png'
import { getAuth, signOut } from 'firebase/auth'

const Sidebar = () => {
  const navigate = useNavigate()

  const logout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Error in logout:', error)
    }
  }
  return (
    <div className='sidebar'>
      <div className='top'>
        <Link to='/' style={{ textDecoration: 'none' }}>
          <div>
            <img
              style={{ width: '230px', height: 'auto', margin: '50px' }}
              src={logoImage}
              alt=''
            />
          </div>
        </Link>
      </div>
      <hr />
      <div className='center'>
        <ul>
          <Link to='/' style={{ textDecoration: 'none' }}>
            <li>
              <DashboardIcon className='icon' />
              <span>Home</span>
            </li>
          </Link>
        </ul>
        <ul>
          <Link to='/slots' style={{ textDecoration: 'none' }}>
            <li>
              <GroupIcon className='icon' />
              <span>Slots</span>
            </li>
          </Link>
        </ul>
        <ul>
          <Link to='/bookings' style={{ textDecoration: 'none' }}>
            <li>
              <BookOnlineIcon className='icon' />
              <span>Bookings</span>
            </li>
          </Link>
        </ul>

        <ul>
          <Link to='/rating_reviews' style={{ textDecoration: 'none' }}>
            <li>
              <ChatIcon className='icon' />
              <span>Rating & Reviews</span>
            </li>
          </Link>
        </ul>
        <ul>
          <Link to='/sports_facilities' style={{ textDecoration: 'none' }}>
            <li>
              <SettingsIcon className='icon' />
              <span>Sports & Facilities</span>
            </li>
          </Link>
        </ul>

        <ul>
          <Link style={{ textDecoration: 'none' }}>
            <li className='listLogout' onClick={logout}>
              <LogoutIcon className='icon' />
              <span>Logout</span>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
