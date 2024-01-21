import React, { useState, useEffect } from 'react'
import './Widgets.scss'
import HistoryIcon from '@mui/icons-material/History'
import BookOnlineIcon from '@mui/icons-material/BookOnline'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import { useUser } from '../../../UserContext'
import { useArena } from '../../../arenaProvider'
import { Link } from 'react-router-dom'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: 'playpal-10854.firebaseapp.com',
  projectId: 'playpal-10854',
  storageBucket: 'playpal-10854.appspot.com',
  messagingSenderId: '114746221695',
  appId: '1:114746221695:web:a6045ad82ef15e5ed8cb4a',
  measurementId: 'G-HYF5TB862H',
}
const app = initializeApp(firebaseConfig)

const Widgets = ({ type }) => {
  let data
  const { user } = useUser()
  const { arenaId } = useArena()

  const auth = getAuth()
  const firestore = getFirestore(app)
  const [slots, setSlots] = useState([])
  const [totalSlots, setTotalSlots] = useState(0)

  const [bookings, setBookings] = useState([])
  const [totalBookings, setTotalBookings] = useState(0)
  const [bookingAmounts, setBookingAmounts] = useState([])

  useEffect(() => {
    const fetchBookingAmounts = async () => {
      try {
        const bookingsCollectionRef = collection(firestore, 'bookings')
        const bookingsQuery = query(
          bookingsCollectionRef,
          where('arenaId', '==', arenaId)
        )
        const bookingsSnapshot = await getDocs(bookingsQuery)

        let totalAmount = 0
        bookingsSnapshot.forEach((doc) => {
          const bookingData = doc.data()
          const bookingAmount = bookingData.amount

          totalAmount += bookingAmount
        })

        setBookingAmounts(totalAmount)
      } catch (error) {
        console.error('Error fetching booking amounts:', error)
        // Handle error appropriately
      }
    }

    if (arenaId) {
      fetchBookingAmounts()
    }
  }, [arenaId, firestore])

  useEffect(() => {
    const fetchSlots = async () => {
      if (!arenaId) {
        return
      }

      const firestore = getFirestore()
      const arenasRef = collection(firestore, 'arenas')
      const arenaQuery = query(arenasRef, where('arenaId', '==', arenaId))

      try {
        const arenaSnapshot = await getDocs(arenaQuery)

        // Assuming 'slots' is an array field in the arena document
        const arenaData = arenaSnapshot.docs[0]?.data()
        const fetchedSlots = arenaData?.slots || []

        // Update the state with the fetched data
        setSlots(fetchedSlots)

        // Calculate and set the total number of slots
        setTotalSlots(fetchedSlots.length)
      } catch (error) {
        console.error('Error fetching slots:', error.message)
      }
    }

    const fetchBookings = async () => {
      if (!arenaId) {
        return
      }

      const firestore = getFirestore()
      const bookingsRef = collection(firestore, 'bookings')
      const bookingsQuery = query(bookingsRef, where('arenaId', '==', arenaId))

      try {
        const bookingsSnapshot = await getDocs(bookingsQuery)

        // Assuming 'bookings' is an array field in the bookings document
        const fetchedBookings = bookingsSnapshot.docs.map((doc) => doc.data())

        // Update the state with the fetched data
        setBookings(fetchedBookings)

        // Calculate and set the total number of bookings
        setTotalBookings(fetchedBookings.length)
      } catch (error) {
        console.error('Error fetching bookings:', error.message)
      }
    }

    // Fetch slots and bookings when the component mounts and when arenaId changes
    fetchSlots()
    fetchBookings()
  }, [arenaId])

  switch (type) {
    case 'user':
      data = {
        title: 'Total Slots',
        isMoney: false,
        link: (
          <Link to='/slots' className='custom-link'>
            View all Slots
          </Link>
        ),
        amount: totalSlots,
        icon: (
          <HistoryIcon
            className='icon'
            style={{ color: 'crimson', backgroundColor: ' rgb(223, 136, 192)' }}
          />
        ),
      }
      break

    case 'booking':
      data = {
        title: 'Total Bookings',
        isMoney: false,
        link: (
          <Link to='/bookings' className='custom-link'>
            View all Bookings
          </Link>
        ),
        amount: totalBookings,
        icon: (
          <BookOnlineIcon
            className='icon'
            style={{ color: 'orange', backgroundColor: ' #f0ce8e' }}
          />
        ),
      }
      break

    case 'revenue':
      data = {
        title: 'Total Revenue',
        isMoney: false,
        amount: <span>{bookingAmounts} PKR</span>,
        icon: (
          <MonetizationOnIcon
            className='icon'
            style={{ color: 'green', backgroundColor: 'rgb(118, 227, 118)' }}
          />
        ),
      }
      break
  }

  return (
    <div className='widget'>
      <div className='left'>
        <span className='title'>{data.title}</span>
        <span className='counter'>
          {data.isMoney && 'PKR '}
          {data.amount}
        </span>
        <span className='link'>{data.link}</span>
      </div>
      <div className='right'>{data.icon}</div>
    </div>
  )
}

export default Widgets
