import React, { useState, useEffect } from 'react'
import { Container, Form, Button, Row, Col } from 'react-bootstrap'
import cityData from '../../Assets/cityData.json'
import sportsList from '../../Assets/sportsList.json'
import { useUser } from '../../UserContext'
import { useArena } from '../../arenaProvider'
import { Carousel } from 'react-bootstrap'
import Select from 'react-select'
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  updateDoc,
  query,
  getDoc,
  where,
  getDocs,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { useNavigate } from 'react-router-dom'

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

const WelcomePage = () => {
  const [selectedSports, setSelectedSports] = useState([])
  const [arenaName, setArenaName] = useState('')
  const [arenaPics, setArenaPics] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [address, setAddress] = useState('')
  const { user } = useUser()
  const { setArenaId } = useArena()
  const firestore = getFirestore(app)
  const storage = getStorage(app)
  const navigate = useNavigate()

  const handleCheckboxChange = (e) => {
    const { value } = e.target

    setSelectedSports((prevSelected) => {
      const sportId = Object.keys(sportsList).find(
        (id) => sportsList[id].name === value
      )

      return sportId
        ? prevSelected.includes(sportId)
          ? prevSelected.filter((id) => id !== sportId)
          : [...prevSelected, sportId]
        : prevSelected
    })
  }

  const handleArenaPicsChange = async (e) => {
    const files = Array.from(e.target.files)

    // Upload each file to Firebase Storage
    const uploadPromises = files.map(async (file) => {
      const storageRef = ref(storage, `arena_images/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    })

    // Wait for all uploads to complete
    const imageUrls = await Promise.all(uploadPromises)

    // Update state with image URLs
    setArenaPics((prevPics) => [...prevPics, ...imageUrls])
  }

  const handleCreateArena = async () => {
    try {
      // Check if any of the required fields is empty
      if (
        !arenaName ||
        !address ||
        !selectedCity ||
        selectedSports.length === 0
      ) {
        alert('Please fill in all fields before saving.')
        return
      }

      // Check if the user already has an associated arena
      const userArenaQuery = query(
        collection(firestore, 'arenas'),
        where('userId', '==', user.uid)
      )

      const userArenaSnapshot = await getDocs(userArenaQuery)

      if (!userArenaSnapshot.empty) {
        // User already has an associated arena, update the existing document
        const userArenaDoc = userArenaSnapshot.docs[0]
        const existingArenaId = userArenaDoc.id

        // Get the existing arena data
        const existingArenaData = userArenaDoc.data()

        // Update the relevant properties with the new values
        const updatedArenaData = {
          ...existingArenaData,
          sports: selectedSports,
          name: arenaName,
          city: selectedCity,
          address: address,
          complete: true,
          approved: false,
          facilities: [],
          holiday: false,
          location: {
            latitude: '',
            longitude: '',
          },
          slots: [],
          rating: [],
          arenaPics: arenaPics,
        }

        await setDoc(
          doc(firestore, 'arenas', existingArenaId),
          updatedArenaData
        )
        setArenaId(existingArenaId)
        alert('Logged in')
        navigate('/')
      }
    } catch (error) {
      console.error('Error creating/updating arena: ', error.message)
    }
  }

  return (
    <div
      className='d-flex align-items-center justify-content-center vh-100 rounded-lg'
      style={{
        backgroundColor: 'hwb(227 10% 67%)',
      }}
    >
      <Container
        style={{
          backgroundColor: '#F5F7F8',
          padding: '50px',
          width: '800px',
          borderRadius: '20px',
        }}
      >
        <h2
          className='text-1xl font-bold mb-4 text-center'
          style={{ color: 'hwb(227 10% 67%)' }}
        >
          Welcome to PlayPal
        </h2>

        <Form>
          <Row className='mb-3'>
            <Col>
              <Form.Control
                placeholder='Arena Name'
                value={arenaName}
                onChange={(e) => setArenaName(e.target.value)}
              />
            </Col>
            <Col>
              <Form.Control
                placeholder='Arena Address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Col>
          </Row>

          <Row className='mb-1'>
            <Col>
              <Form.Group controlId='formArenaPics'>
                <Form.Label>Arena Pictures</Form.Label>
                <Form.Control
                  type='file'
                  multiple
                  onChange={handleArenaPicsChange}
                />
              </Form.Group>

              <Carousel className='mt-3'>
                {arenaPics.map((pic, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className='d-block w-100'
                      src={pic}
                      alt={`Arena Pic ${index}`}
                      style={{
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
            <Col>
              <div
                style={{
                  marginBottom: '8px',
                }}
              >
                Select City
              </div>
              <Select
                placeholder='Select City'
                value={{ label: selectedCity, value: selectedCity }}
                onChange={(selectedOption) =>
                  setSelectedCity(selectedOption ? selectedOption.value : '')
                }
                options={cityData.map((city) => ({
                  label: city.city,
                  value: city.city,
                }))}
              />
            </Col>
          </Row>
        </Form>

        <Form>
          <div
            style={{
              marginBottom: '8px',
            }}
          >
            Select Sports
          </div>

          <Row>
            {[0, 1, 2, 3].map((rowIndex) => (
              <Col key={rowIndex}>
                {Object.keys(sportsList)
                  .slice(rowIndex * 2, (rowIndex + 1) * 2)
                  .map((sportId) => (
                    <Form.Check
                      key={sportId}
                      type='checkbox'
                      id={`sport-checkbox-${sportId}`}
                      label={sportsList[sportId].name}
                      value={sportsList[sportId].name}
                      checked={selectedSports.includes(sportId)}
                      onChange={handleCheckboxChange}
                    />
                  ))}
              </Col>
            ))}
          </Row>

          <Button
            variant='primary'
            onClick={handleCreateArena}
            className='mt-5'
            style={{
              width: '15%',
              marginLeft: '300px',
            }}
          >
            Save
          </Button>
        </Form>
      </Container>
    </div>
  )
}

export default WelcomePage
