import './App.css'
import SignUp from './Pages/SignUp/SignUp'
import Login from './Pages/Login/Login'
import WelcomePage from './Pages/WelcomePage/WelcomePage'
import Dashboard from './Pages/Dashboard/Dashboard'
import Slots from './Pages/Slots/Slots'
import Bookings from './Pages/Bookings/Bookings'
import AdminProfile from './Pages/Profile/AdminProfile'
import Rating_Reviews from './Pages/Rating & Reviews/Rating & Reviews'
import Sports_Facilities from './Pages/Sports & Facilities/Sports & Facilities'
import Map from './Pages/Map/Map'
import { AuthContext } from './context/AuthContext'
import { useContext } from 'react'
import { UserProvider } from './UserContext'
import { ArenaProvider } from './arenaProvider'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  const { currentUser } = useContext(AuthContext)
  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to='/login' />
  }

  return (
   <div className='App'>
      <UserProvider>
        <ArenaProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<SignUp />} />
              <Route
                path='/'
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path='/welcomePage'
                element={
                  <RequireAuth>
                    <WelcomePage />
                  </RequireAuth>
                }
              />
              <Route
                path='/map'
                element={
                  <RequireAuth>
                    <Map />
                  </RequireAuth>
                }
              />
              <Route
                path='/slots'
                element={
                  <RequireAuth>
                    <Slots />
                  </RequireAuth>
                }
              />
              <Route
                path='/bookings'
                element={
                  <RequireAuth>
                    <Bookings />
                  </RequireAuth>
                }
              />
              <Route
                path='/rating_reviews'
                element={
                  <RequireAuth>
                    <Rating_Reviews />
                  </RequireAuth>
                }
              />
              <Route
                path='/sports_facilities'
                element={
                  <RequireAuth>
                    <Sports_Facilities />
                  </RequireAuth>
                }
              />
              <Route
                path='/profile'
                element={
                  <RequireAuth>
                    <AdminProfile />
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </ArenaProvider>
      </UserProvider>
    </div>
  )
}

export default App
