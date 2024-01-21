import React, { useEffect, useState } from 'react'
import { Form, Table, Pagination } from 'react-bootstrap'
import StarHalfIcon from '@mui/icons-material/StarHalf'
import StarIcon from '@mui/icons-material/Star'
import Layout from '../../components/Layout'
import { getAreanaRatings } from '../../services/api'
import { auth } from '../../firebase'
import { useUser } from '../../UserContext'
import { useArena } from '../../arenaProvider'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

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

const ITEMS_PER_PAGE = 5

const Rating_Reviews = () => {
  const [users, setUsers] = useState([])
  const [ratingFilter, setRatingFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const { user } = useUser()
  const { arenaId } = useArena()
  const [arenaRatings, setArenaRatings] = useState([])

  const auth = getAuth()
  const firestore = getFirestore(app)

  const handleRatingFilterChange = (rating) => {
    setRatingFilter(rating)
  }

  const filterUsers = (rating) => {
    const filteredRatings =
      rating === 'All'
        ? arenaRatings.flatMap((arena) => arena.ratings)
        : arenaRatings
            .flatMap((arena) => arena.ratings)
            .filter((item) => item.ratingValue === parseFloat(rating))

    setUsers(filteredRatings)
    setCurrentPage(1)
  }

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE)

  // Calculate the index of the first and last item to display on the current page
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE

  // Get the items for the current page
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    const fetchArenaRatings = async () => {
      if (!arenaId) {
        return
      }

      const arenasRef = collection(firestore, 'arenas')
      const arenaRatingsQuery = query(
        arenasRef,
        where('arenaId', '==', arenaId)
      )

      try {
        const arenaRatingsSnapshot = await getDocs(arenaRatingsQuery)

        const arenaRatingsData = arenaRatingsSnapshot.docs.map((doc) => {
          const { rating } = doc.data()
          return {
            id: doc.id,
            ratings: rating || [],
          }
        })

        setArenaRatings(arenaRatingsData)
      } catch (error) {
        console.error('Error fetching arena ratings:', error.message)
      }
    }

    fetchArenaRatings()
  }, [arenaId])

  useEffect(() => {
    // Initially set users with all ratings
    setUsers(arenaRatings.flatMap((arena) => arena.ratings))
  }, [arenaRatings])

  useEffect(() => {
    filterUsers(ratingFilter)
  }, [ratingFilter, arenaRatings])

  return (
    <Layout>
      <div className='container mx-auto p-4'>
        <h2 className='text-1xl font-bold mb-4 text-center'>
          Ratings & Reviews
        </h2>
        <div className='mb-4'>
          <Form>
            <Form.Group controlId='ratingFilter'>
              <Form.Label className='text-black mr-2'>
                Filter by Ratings:
              </Form.Label>
              <Form.Control
                as='select'
                value={ratingFilter}
                onChange={(e) => handleRatingFilterChange(e.target.value)}
              >
                <option value='All'>All</option>
                <option value='5'>5</option>
                <option value='4'>4</option>
                <option value='3'>3</option>
                <option value='2'>2</option>
                <option value='1'>1</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
        <div>
          <Table striped bordered hover variant=''>
            <thead>
              <tr>
                <th className='text-center'>No.</th>
                <th className='text-center'>Name</th>
                <th className='text-center'>Reviews</th>
                <th className='text-center'>Ratings</th>
                <th className='text-center'>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((item, index) => (
                <tr key={index}>
                  <td className='text-center'>{index + 1}</td>
                  <td className='text-center'>{item.reviewerName}</td>
                  <td className='text-center'>{item.review}</td>
                  <td className='text-center'>
                    {[...Array(Math.floor(item.ratingValue))].map(
                      (_, starIndex) => (
                        <StarIcon key={starIndex} className='text-warning' />
                      )
                    )}
                    {item.ratingValue % 1 !== 0 && (
                      <StarHalfIcon className='text-warning' />
                    )}
                  </td>
                  <td className='text-center'>
                    {item.timestamp.toDate().toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className='mt-3'>
            <Pagination.Prev
              onClick={() =>
                setCurrentPage((prevPage) =>
                  prevPage > 1 ? prevPage - 1 : prevPage
                )
              }
            />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() =>
                setCurrentPage((prevPage) =>
                  prevPage < totalPages ? prevPage + 1 : prevPage
                )
              }
            />
          </Pagination>
        </div>
      </div>
    </Layout>
  )
}

export default Rating_Reviews
