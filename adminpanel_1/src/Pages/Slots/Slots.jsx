import React, { useState, useEffect } from 'react'
import {
  Form,
  Row,
  Col,
  Button,
  Dropdown,
  Modal,
  Container,
  Card,
} from 'react-bootstrap'
import Layout from '../../components/Layout'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { useUser } from '../../UserContext'
import { useArena } from '../../arenaProvider'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot, // Add this import
  deleteDoc, // Add this import
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

const Slots = () => {
  const [showModal, setShowModal] = useState(false)
  const { user } = useUser()
  const { arenaId } = useArena()

  const auth = getAuth()
  const firestore = getFirestore(app)
  const [slots, setSlots] = useState([])

  let fetchSlots // Declare fetchSlots in the top-level scope

  useEffect(() => {
    const fetchSlots = async () => {
      if (!arenaId) {
        return
      }

      const arenasRef = collection(firestore, 'arenas')
      const arenaQuery = query(arenasRef, where('arenaId', '==', arenaId))

      try {
        const arenaSnapshot = await getDocs(arenaQuery)
        const arenaData = arenaSnapshot.docs[0]?.data()
        const fetchedSlots = arenaData?.slots || []

        setSlots(fetchedSlots)

        // Set up real-time updates using onSnapshot
        const unsubscribe = onSnapshot(arenaQuery, (snapshot) => {
          const updatedData = snapshot.docs[0]?.data()
          const updatedSlots = updatedData?.slots || []
          setSlots(updatedSlots)
        })

        // Clean up the subscription when the component unmounts
        return () => unsubscribe()
      } catch (error) {
        console.error('Error fetching slots:', error.message)
      }
    }

    fetchSlots()
  }, [arenaId])

  function generateRandomId() {
    return Math.floor(100 + Math.random() * 900) // generates a random 3-digit number
  }

  const handleDeleteSlot = async (slotId) => {
    if (!arenaId || !slotId) {
      return
    }

    const arenaRef = doc(collection(firestore, 'arenas'), arenaId)

    try {
      const arenaDocSnapshot = await getDoc(arenaRef)
      const existingSlots = arenaDocSnapshot.data().slots || []

      // Filter out the slot to be deleted
      const updatedSlots = existingSlots.filter(
        (slot) => slot.slotId !== slotId
      )

      // Update the 'slots' field in the arena document
      await updateDoc(arenaRef, { slots: updatedSlots })

      alert('Slot deleted successfully!')
      fetchSlots()
    } catch (error) {
      console.error('Error deleting slot:', error.message)
    }
  }

  const AddSlots = ({ showModal, setShowModal }) => {
    const [selectedGame, setSelectedGame] = useState('')
    const [selectedDays, setSelectedDays] = useState([])
    const [selectedTime, setSelectedTime] = useState()
    const [selectTime, setSelectTime] = useState()

    const handleAddSlot = async (newSlotData) => {
      if (!arenaId || !newSlotData) {
        // Ensure arenaId and newSlotData are present
        return
      }

      const arenaRef = doc(collection(firestore, 'arenas'), arenaId)

      try {
        // Fetch the existing slots array
        const arenaDocSnapshot = await getDoc(arenaRef)
        const existingSlots = arenaDocSnapshot.data().slots || []

        // Generate a random 5-digit number as ID
        const slotId = generateRandomId()

        newSlotData.slotId = slotId

        // Add the new slot data to the array
        const updatedSlots = [...existingSlots, newSlotData]

        // Update the 'slots' field in the arena document
        await updateDoc(arenaRef, { slots: updatedSlots })

        alert('Slot added successfully!')
      } catch (error) {
        console.error('Error adding slot:', error.message)
      }
    }

    const handleGameSelect = (game) => {
      setSelectedGame(game)
    }

    const sports = [
      'Cricket',
      'Football',
      'Hockey',
      'Volleyball',
      'Tennis',
      'Basketball',
      'Table Tennis',
      'Badminton',
    ]

    const handleTimeChange = (time) => {
      setSelectedTime(time)
    }

    const handleTimeChange2 = (time) => {
      setSelectTime(time)
    }

    const handleCheckboxChange = (event) => {
      const { value, checked } = event.target

      if (checked) {
        setSelectedDays([...selectedDays, value])
      } else {
        setSelectedDays(selectedDays.filter((day) => day !== value))
      }
    }

    const handleSubmit = async (event) => {
      event.preventDefault()

      const game = selectedGame
      const price = event.target.price.value
      //const slotid = event.target.slotid.value
      const startTime =
        selectedTime instanceof Date ? formatTime(selectedTime) : null
      const endTime = selectTime instanceof Date ? formatTime(selectTime) : null

      if (
        !game ||
        !price ||
        !startTime ||
        !endTime ||
        selectedDays.length === 0
      ) {
        alert('Please enter all fields.')
        return
      }

      // Validate end time is after start time
      if (startTime && endTime && compareTimes(startTime, endTime) >= 0) {
        alert('End time must be after start time.')
        return
      }

      const newSlotData = {
        game,
        price: parseInt(price),
        startTime,
        endTime,
        days: selectedDays,
      }

      // Call handleAddSlot to add the new slot
      await handleAddSlot(newSlotData)

      // Update the local state with the fetched data (assuming you have a state variable for slots)
      setSlots([...slots, newSlotData])

      setShowModal(false)
    }

    return (
      <>
        <Container>
          <Form className='mx-auto p-5' onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Label>Choose the Sports</Form.Label>
                <Dropdown>
                  <Dropdown.Toggle id='sports-dropdown'>
                    {selectedGame || 'Select'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {sports.map((game) => (
                      <Dropdown.Item
                        key={game}
                        onClick={() => handleGameSelect(game)}
                      >
                        {game}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col>
                <Form.Group controlId='price'>
                  <Form.Label>Set Price(PKR)</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Enter your price'
                    name='price'
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className='hours'>
              <Col className='mt-3'>
                <Form.Group controlId='startTime'>
                  <Form.Label>Start time:</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DemoContainer components={['TimePicker']}>
                      <TimePicker
                        label='StartTime'
                        value={selectedTime}
                        onChange={handleTimeChange}
                        step={15}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Form.Group>
              </Col>
              <Col className='mt-3'>
                <Form.Group controlId='endTime'>
                  <Form.Label>End time:</Form.Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DemoContainer components={['TimePicker']}>
                      <TimePicker
                        label='EndTime'
                        value={selectTime}
                        onChange={handleTimeChange2}
                        step={15}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Form.Group>
              </Col>
            </Row>

            <Row className='day'>
              <Col className='mt-3'>
                <Form.Label>Set Days</Form.Label>
              </Col>
            </Row>
            {[0, 1, 2].map((rowIndex) => (
              <Row key={rowIndex}>
                {[
                  'Sunday',
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                ]
                  .slice(rowIndex * 3, (rowIndex + 1) * 3)
                  .map((day, index) => (
                    <Col key={index} xs={4}>
                      <Form.Check
                        type='checkbox'
                        id={`day-checkbox-${rowIndex}-${index}`}
                        label={day}
                        value={day}
                        checked={selectedDays.includes(day)}
                        onChange={handleCheckboxChange}
                      />
                    </Col>
                  ))}
              </Row>
            ))}

            <div style={{ textAlign: 'center' }}>
              <Button className='button mt-3' variant='primary' type='submit'>
                Submit
              </Button>
            </div>
          </Form>
        </Container>
      </>
    )
  }

  return (
    <Layout>
      <Container>
        <h2 className='text-1xl font-bold m-4 text-center'>Slots</h2>

        <Card>
          <Card.Body>
            <Button variant='primary' onClick={() => setShowModal(true)}>
              Add Slots
            </Button>

            {slots.length === 0 ? (
              <p style={{ marginTop: '10px' }}>No slots added yet!</p>
            ) : (
              <Row xs={1} md={3} lg={3}>
                {slots.map((data, index) => (
                  <Col key={index}>
                    <Card
                      style={{
                        width: '88%',
                        margin: '1rem',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'hwb(227 10% 55%)',
                        color: 'white',
                      }}
                    >
                      <Card.Body>
                        <Card.Title
                          style={{
                            fontSize: '1.5rem',
                            marginBottom: '1rem',
                            textAlign: 'center',
                          }}
                        >
                          {data.game}
                          <hr />
                        </Card.Title>
                        <Card.Text style={{ marginBottom: '0.5rem' }}>
                          <strong>SlotId:</strong> Slot {data.slotId}
                        </Card.Text>
                        <Card.Text style={{ marginBottom: '0.5rem' }}>
                          <strong>Price:</strong> {data.price} PKR
                        </Card.Text>
                        <Card.Text style={{ marginBottom: '0.5rem' }}>
                          <strong>Start Time:</strong> {data.startTime}
                        </Card.Text>
                        <Card.Text style={{ marginBottom: '0.5rem' }}>
                          <strong>End Time:</strong> {data.endTime}
                        </Card.Text>
                        <Card.Text style={{ marginBottom: '0.5rem' }}>
                          <strong>Days:</strong> {data.days.join(' ')}
                        </Card.Text>
                        <div style={{ textAlign: 'center' }}>
                          <Button
                            variant='danger'
                            onClick={() => handleDeleteSlot(data.slotId)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Add Slots</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <AddSlots showModal={showModal} setShowModal={setShowModal} />
              </Modal.Body>
            </Modal>
          </Card.Body>
        </Card>
      </Container>
    </Layout>
  )
}

export default Slots

function compareTimes(time1, time2) {
  const [hours1, minutes1, period1] = parseTime(time1)
  const [hours2, minutes2, period2] = parseTime(time2)

  if (period1 !== period2) {
    // AM comes before PM
    return period1 === 'AM' ? -1 : 1
  }

  if (hours1 !== hours2) {
    return hours1 - hours2
  }

  return minutes1 - minutes2
}

function parseTime(time) {
  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':')

  return [parseInt(hours), parseInt(minutes), period]
}

function formatTime(date) {
  let hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  return `${hours}:${minutes} ${period}`
}
