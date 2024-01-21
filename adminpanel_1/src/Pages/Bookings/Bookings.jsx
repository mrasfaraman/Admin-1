import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Pagination } from 'react-bootstrap'
import Layout from '../../components/Layout'
import { auth } from '../../firebase'
import { useArena } from '../../arenaProvider'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { deleteDoc, doc, addDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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

const ITEMS_PER_PAGE = 10

const BookingPage = () => {
  const [bookings, setBookings] = useState([])
  const { arenaId } = useArena()
  const [users, setUsers] = useState([])

  const auth = getAuth()
  const firestore = getFirestore(app)

  const [showAddModal, setShowAddModal] = useState(false)
  const [slots, setSlots] = useState([])

  let count = 0
  const [newBooking, setNewBooking] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    status: '',
  })

  const [formData, setFormData] = useState({
    username: '',
    useremail: '',
    userphone: '',
    bookingDate: null, // Initialize with null
    paymentstatus: '',
    slotId: '',
  })

  const handlePaymentStatusChange = (status, bookingIdToUpdate) => {
    // Update the payment status in Firebase
    const bookingRef = doc(firestore, 'bookings', bookingIdToUpdate)

    updateDoc(bookingRef, { paymentstatus: status })
      .then(() => {
        console.log(`Payment status updated to ${status} in Firebase`)
        // Show an alert to inform the user
        window.alert(
          `Your payment is ${
            status === 'pending' ? 'pending' : 'paid'
          } for booking ID: ${bookingIdToUpdate}`
        )
      })
      .catch((error) => {
        console.error(
          `Error updating payment status to ${status} in Firebase:`,
          error.message
        )
      })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Regular expression for only English alphabets
    const onlyEnglishAlphabets = /^[a-zA-Z ]+$/

    // Validate firstName and lastName fields
    if (
      name === 'username' &&
      value.trim() !== '' &&
      !onlyEnglishAlphabets.test(value)
    ) {
      // Display an error or handle the validation as needed
      alert('Name must contain only English alphabets')
      return
    }

    // Validate phone field
    if (
      name === 'userphone' &&
      value.trim() !== '' &&
      !/^\d{0,11}$/.test(value)
    ) {
      alert('Phone must be up to 11 digits')
      return
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    if (!arenaId || !formData) {
      alert('Missing information')
      return
    }

    const bookingsRef = collection(firestore, 'bookings')

    try {
      // Add a new document to the "bookings" collection
      await addDoc(bookingsRef, {
        arenaId,
        type: 'Offline',
        createdAt: serverTimestamp(),
        ...formData,
      })

      alert('Booking added successfully!')
      handleCloseAddModal()
    } catch (error) {
      alert('Error adding booking: ' + error.message)
    }
  }

  useEffect(() => {
    const bookingsRef = collection(firestore, 'bookings')
    const bookingsQuery = query(bookingsRef, where('arenaId', '==', arenaId))

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const updatedBookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setBookingsData(updatedBookingsData)
    })

    return () => unsubscribe() // Cleanup the subscription when the component unmounts
  }, [arenaId])

  useEffect(() => {
    const fetchUsers = async () => {
      const firestore = getFirestore()
      const usersCollection = collection(firestore, 'users')

      try {
        const usersQuery = query(usersCollection)
        const usersSnapshot = await getDocs(usersQuery)

        const usersData = []
        usersSnapshot.forEach((userDoc) => {
          const userData = {
            id: userDoc.id, // Add the auto-generated ID to the user data
            ...userDoc.data(),
          }
          usersData.push(userData)
        })

        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching users:', error.message)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchArenaSlots = async () => {
      try {
        const slotsCollectionRef = collection(firestore, 'arenas')
        const slotsQuery = query(
          slotsCollectionRef,
          where('arenaId', '==', arenaId)
        )
        const slotsSnapshot = await getDocs(slotsQuery)

        let slotsData = []
        slotsSnapshot.forEach((doc) => {
          const arenaData = doc.data()
          const slotsArray = arenaData.slots || []

          // Concatenate the slots array to the existing slotsData
          slotsData = slotsData.concat(slotsArray)
        })

        setSlots(slotsData)
      } catch (error) {
        console.error('Error fetching arena slots:', error)
        // Handle error appropriately
      }
    }

    if (arenaId) {
      fetchArenaSlots()
    }
  }, [arenaId, firestore])

  const [bookingsData, setBookingsData] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(firestore, 'bookings')
      const bookingsQuery = query(bookingsRef, where('arenaId', '==', arenaId))
      const bookingsSnapshot = await getDocs(bookingsQuery)

      const bookingsData = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setBookingsData(bookingsData)
    } catch (error) {
      console.error('Error fetching bookings:', error.message)
    }
  }
  const deleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(firestore, 'bookings', bookingId)
      await deleteDoc(bookingRef)
    } catch (error) {
      console.error('Error deleting booking:', error.message)
    }
  }

  useEffect(() => {
    if (arenaId) {
      fetchBookings()
    }
  }, [arenaId])

  const handleDelete = () => {
    if (selectedBooking) {
      const updatedBookings = bookings.filter(
        (booking) => booking.id !== selectedBooking.id
      )
      setBookings(updatedBookings)
      handleCloseDeleteModal()
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedBooking(null)
  }

  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE)
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentBookings = bookings.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const handleShowAddModal = () => {
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setNewBooking({
      id: bookings.length + 1,
      name: '',
      email: '',
      phone: '',
      date: '',
      startTime: '',
      endTime: '',
      status: '',
    })
  }

  const handleInputChangeAmount = (e) => {
    const { name, value } = e.target

    // Check if the selected slot is already booked
    const isSlotAlreadyBooked = bookingsData.some(
      (booking) => booking.slotId === value
    )

    if (isSlotAlreadyBooked) {
      alert('This slot is already booked. Please select another slot.')
    } else {
      // Access the selected slot's amount using the data-amount attribute
      const selectedSlotAmount =
        e.target.options[e.target.selectedIndex].getAttribute('data-amount')

      // Set formData only if the slot is not booked
      setFormData({
        ...formData,
        [name]: value,
        amount: selectedSlotAmount,
      })
    }
  }

  const getSlotDetails = (slotId) => {
    const matchingSlot = slots.find((slot) => slot.slotId === slotId)

    if (matchingSlot) {
      return {
        startTime: matchingSlot.startTime || 'N/A',
        endTime: matchingSlot.endTime || 'N/A',
      }
    } else {
      return { startTime: 'N/A', endTime: 'N/A' }
    }
  }

  const handleDeleteClick = (bookingId, bookingType) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(bookingId)
    }
  }
  const getUserDetails = (userId) => {
    const user = users.find((user) => user.id === userId)
    return user || null
  }
  const handleDateChange = (date) => {
    // Check if the selected date is earlier than the current date
    const currentDate = new Date()
    if (date < currentDate) {
      // Show validation message to the user (you can use state to manage this)
      alert('Cannot select a date earlier than the current date')
    } else {
      // Update the form data if the selected date is valid
      setFormData({ ...formData, bookingDate: date })
    }
  }

  return (
    <Layout>
      <div className='container mx-auto p-4'>
        <h2 className='text-1xl font-bold mb-4 text-center'>Booking</h2>
        <div>
          <div className='d-flex justify-content-end'>
            <Button
              variant='primary'
              onClick={handleShowAddModal}
              style={{ marginBottom: '20px' }}
            >
              Add Booking
            </Button>
          </div>
          <div>
            <text>Manual Booking</text>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='text-center'>No.</th>
                <th className='text-center'>Name</th>
                <th className='text-center'>Email</th>
                <th className='text-center'>Phone</th>
                <th className='text-center'>Date</th>
                <th className='text-center'>Start Time</th>
                <th className='text-center'>End Time</th>
                <th className='text-center'>Payment Status</th>
                <th className='text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking, index) => {
                const slotDetails = getSlotDetails(booking.slotId)

                // Render the row only if booking.type is "Offline"
                if (booking.type === 'Offline') {
                  return (
                    <tr
                      key={booking.id}
                      className='hover-bg-white hover-text-black'
                    >
                      <td className='text-center'>{index + 1}</td>
                      <td className='text-center'>{booking.username}</td>
                      <td className='text-center'>{booking.useremail}</td>
                      <td className='text-center'>{booking.userphone}</td>
                      <td className='text-center'>
                        {booking.bookingDate.toDate
                          ? booking.bookingDate.toDate().toLocaleDateString()
                          : booking.bookingDate}
                      </td>

                      <td className='text-center'>{slotDetails.startTime}</td>
                      <td className='text-center'>{slotDetails.endTime}</td>
                      <td className='text-center'>
                        {/* Display buttons based on payment status */}
                        {booking.paymentstatus === 'pending' ? (
                          <Button
                            variant='success'
                            onClick={() =>
                              handlePaymentStatusChange('paid', booking.id)
                            }
                          >
                            Pending
                          </Button>
                        ) : (
                          <Button variant='danger' disabled>
                            Paid
                          </Button>
                        )}
                      </td>

                      <td className='text-center'>
                        <Button
                          variant='danger'
                          onClick={() =>
                            handleDeleteClick(booking.id, booking.type)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  )
                }

                // If booking.type is not "Offline," return null (no row will be rendered)
                return null
              })}
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
          <div>
            <text>InApp Booking</text>
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th className='text-center'>No.</th>
                <th className='text-center'>Name</th>
                <th className='text-center'>Email</th>
                <th className='text-center'>Phone</th>
                <th className='text-center'>Date</th>
                <th className='text-center'>Start Time</th>
                <th className='text-center'>End Time</th>
                <th className='text-center'>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking, index) => {
                const slotDetails = getSlotDetails(booking.slotId)
                const userDetails = getUserDetails(booking.userId)

                if (booking.type === 'inApp') {
                  const formattedBookingDate = booking.bookingDate
                    .toDate()
                    .toLocaleDateString()

                  return (
                    <tr
                      key={booking.id}
                      className='hover-bg-white hover-text-black'
                    >
                      <td className='text-center'>{count + 1}</td>
                      <td className='text-center'>{`${userDetails.firstName} ${userDetails.lastName}`}</td>
                      <td className='text-center'>{userDetails.email}</td>
                      <td className='text-center'>{userDetails.phone}</td>
                      <td className='text-center'>{formattedBookingDate}</td>
                      <td className='text-center'>{slotDetails.startTime}</td>
                      <td className='text-center'>{slotDetails.endTime}</td>
                      <td className='text-center'>
                        <Button
                          variant='danger'
                          onClick={() => handleDeleteClick(booking.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  )
                }

                // If booking.type is not "Offline," return null (no row will be rendered)
                return null
              })}
            </tbody>
          </Table>
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Booking</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete the booking?
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button variant='danger' onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showAddModal} onHide={handleCloseAddModal}>
            <Modal.Header closeButton>
              <Modal.Title>Add Booking</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId='username'>
                  <Form.Label>Name:</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter name'
                    name='username'
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group controlId='useremail'>
                  <Form.Label>Email:</Form.Label>
                  <Form.Control
                    type='email'
                    placeholder='Enter email'
                    name='useremail'
                    value={formData.useremail}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group controlId='userphone'>
                  <Form.Label>Phone:</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Enter phone'
                    name='userphone'
                    value={formData.userphone}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Label>Booking Date:</Form.Label>
                <Form.Group controlId='bookingDate'>
                  <DatePicker
                    selected={formData.bookingDate}
                    onChange={(date) => handleDateChange(date)}
                    dateFormat='MM/dd/yyyy'
                    placeholderText='Select date'
                    minDate={new Date()} // Set the minimum allowed date to the current date
                  />
                </Form.Group>

                <Form.Group controlId='paymentstatus'>
                  <Form.Label>Payment Status:</Form.Label>
                  <Form.Control
                    as='select'
                    name='paymentstatus'
                    value={formData.paymentstatus}
                    onChange={handleInputChange}
                  >
                    <option value=''>Select Status</option>
                    <option value='pending'>Pending</option>
                    <option value='paid'>Paid</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId='slotId'>
                  <Form.Label>Slot:</Form.Label>
                  <Form.Control
                    as='select'
                    name='slotId'
                    value={formData.slotId}
                    onChange={handleInputChangeAmount}
                  >
                    <option value=''>Select Slot</option>
                    {slots.map((data, index) => (
                      <option
                        key={index}
                        value={data.slotId}
                        data-amount={data.price}
                      >
                        Slot {data.slotId}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={handleCloseAddModal}>
                Cancel
              </Button>
              <Button variant='primary' onClick={handleSave}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </Layout>
  )
}

export default BookingPage
