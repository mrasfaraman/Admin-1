import React, { useState, useEffect } from 'react'
import './Chart.scss'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useUser } from '../../../UserContext'
import { useArena } from '../../../arenaProvider'
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

const Chart = () => {
  const { arenaId } = useArena()
  const auth = getAuth()
  const firestore = getFirestore(app)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const bookingsCollectionRef = collection(firestore, 'bookings')
        const bookingsQuery = query(
          bookingsCollectionRef,
          where('arenaId', '==', arenaId)
        )
        const bookingsSnapshot = await getDocs(bookingsQuery)

        const chartData = []
        bookingsSnapshot.forEach((doc) => {
          const bookingData = doc.data()
          // Extract necessary information for the chart
          const createdAt = bookingData.createdAt.toDate() // Assuming createdAt is a Firestore Timestamp
          const amount = bookingData.amount

          // Create a data point for the chart
          chartData.push({
            name: createdAt.toLocaleDateString(),
            Total: amount,
          })
        })

        // Sort the data by date
        chartData.sort((a, b) => a.name.localeCompare(b.name))

        setChartData(chartData)
      } catch (error) {
        console.error('Error fetching booking data:', error)
        // Handle error appropriately
      }
    }

    if (arenaId) {
      fetchBookingData()
    }
  }, [arenaId, firestore])
  return (
    <div className='chart'>
      <div className='title'>Current Month Revenue</div>
      <AreaChart
        width={900}
        height={250}
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id='Total' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='hwb(227 10% 67%)' stopOpacity={1} />
            <stop offset='95%' stopColor='hwb(227 10% 67%)' stopOpacity={1} />
          </linearGradient>
        </defs>
        <XAxis dataKey='name' />
        <YAxis />
        <CartesianGrid strokeDasharray='3 3' />
        <Tooltip />
        <Area
          type='monotone'
          dataKey='Total'
          stroke='#8884d8'
          fillOpacity={1}
          fill='url(#Total)'
        />
      </AreaChart>
    </div>
  )
}

export default Chart
