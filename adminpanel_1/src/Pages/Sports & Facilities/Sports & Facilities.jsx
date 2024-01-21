import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { Container, Form, Button, Card } from 'react-bootstrap'
import { useUser } from '../../UserContext'
import { useArena } from '../../arenaProvider'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
  deleteDoc,
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

const SportsFacilities = () => {
  const [facility, setFacility] = useState('')
  const [facilities, setFacilities] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const { user } = useUser()
  const [userFacilities, setUserFacilities] = useState([])
  const { arenaId } = useArena()

  const auth = getAuth()
  const firestore = getFirestore(app)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editIndex === null) {
      // Add a new facility
      if (facilities.includes(facility)) {
        // Display an error message if the facility already exists
        alert('Facility already exists. Please enter a unique facility.')
        return
      }

      setFacilities([...facilities, facility])
    } else {
      // Edit an existing facility
      const updatedFacilities = [...facilities]
      updatedFacilities[editIndex] = facility
      setFacilities(updatedFacilities)
      setEditIndex(null)
    }

    setFacility('')
  }

  const handleCancel = () => {
    // Clear the input without saving
    setFacility('')
    setEditIndex(null)
  }

  useEffect(() => {
    const fetchUserFacilities = async () => {
      if (!arenaId) {
        return
      }

      const arenasRef = collection(firestore, 'arenas')
      const userArenasQuery = query(arenasRef, where('arenaId', '==', arenaId))

      try {
        const userArenasSnapshot = await getDocs(userArenasQuery)

        const userFacilitiesData = userArenasSnapshot.docs.map((doc) => {
          const { facilities } = doc.data()
          return {
            id: doc.id,
            facilities: facilities || [],
          }
        })

        setUserFacilities(userFacilitiesData)

        // Set up real-time updates using onSnapshot
        const unsubscribe = onSnapshot(userArenasQuery, (snapshot) => {
          const updatedData = snapshot.docs.map((doc) => {
            const { facilities } = doc.data()
            return {
              id: doc.id,
              facilities: facilities || [],
            }
          })

          setUserFacilities(updatedData)
        })

        // Clean up the subscription when the component unmounts
        return () => unsubscribe()
      } catch (error) {
        console.error('Error fetching user facilities:', error.message)
      }
    }

    // Fetch user facilities and set up real-time updates when the component mounts
    fetchUserFacilities()
  }, [arenaId])

  const handleAddFacility = async () => {
    if (!arenaId || !facility.trim()) {
      // Ensure arenaId and facility value are present
      return
    }

    // Assuming 'facilities' is an array field in your arena document
    const arenaRef = doc(collection(firestore, 'arenas'), arenaId)

    try {
      // Fetch the existing facilities array
      const arenaDocSnapshot = await getDoc(arenaRef)
      const existingFacilities = arenaDocSnapshot.data().facilities || []

      // Add the new facility to the array
      const updatedFacilities = [...existingFacilities, facility]

      // Update the 'facilities' field in the arena document
      await updateDoc(arenaRef, { facilities: updatedFacilities })
      alert('Added')
      // Clear the form input after adding facility
      setFacility('')
    } catch (error) {
      console.error('Error adding facility:', error.message)
    }
  }

  const handleDeleteFacility = async (facilityToDelete) => {
    if (!arenaId || !facilityToDelete) {
      return
    }

    const arenaRef = doc(collection(firestore, 'arenas'), arenaId)

    try {
      const arenaDocSnapshot = await getDoc(arenaRef)
      const existingFacilities = arenaDocSnapshot.data().facilities || []

      const updatedFacilities = existingFacilities.filter(
        (facility) => facility !== facilityToDelete
      )

      await updateDoc(arenaRef, { facilities: updatedFacilities })
      alert('deleted')
    } catch (error) {
      console.error('Error deleting facility:', error.message)
    }
  }

  return (
    <Layout>
      <h2 className='text-1xl font-bold mb-4 mt-4 text-center'>
        Facilities Management
      </h2>
      <Container className='mx-auto p-5'>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label
              className='mb-2'
              style={{ fontSize: '20px', fontWeight: 'lighter' }}
            >
              Enter the facilities you are providing in your Arena!
            </Form.Label>
            <Form.Control
              type='text'
              placeholder=''
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
            />
          </Form.Group>
          <Button
            type='submit'
            variant='primary'
            className='mt-3'
            onClick={handleAddFacility}
            disabled={!facility.trim()} // Disable the button when the input is empty or only contains whitespace
          >
            {editIndex !== null ? 'Update' : 'Add Facility'}
          </Button>
          {editIndex !== null && (
            <Button
              variant='secondary'
              className='mt-3 ml-2'
              onClick={handleCancel}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </Button>
          )}
        </Form>

        <div className='mt-4'>
          {userFacilities.map((arena) => (
            <div key={arena.id}>
              <ul>
                {arena.facilities.map((facility, index) => (
                  <Card
                    key={index}
                    className='mb-3'
                    style={{
                      background: 'white',
                      color: 'black',
                    }}
                  >
                    <Card.Body className='d-flex justify-content-between align-items-center'>
                      <Card.Title style={{ fontWeight: 'normal' }}>
                        {index + 1}- {facility}
                      </Card.Title>
                      <Button
                        variant='danger'
                        onClick={() => handleDeleteFacility(facility)}
                        className='ml-auto'
                      >
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Layout>
  )
}

export default SportsFacilities
