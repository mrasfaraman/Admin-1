import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Carousel } from 'react-bootstrap'
import Layout from '../../components/Layout'
import { useUser } from '../../UserContext'
import { useArena } from '../../arenaProvider'
import sportsList from '../../Assets/sportsList.json'
import cityData from '../../Assets/cityData.json'
import Select from 'react-select'

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { doc } from 'firebase/firestore'
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

const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad']

const ProfilePage = () => {
  const [profileImage, setProfileImage] = useState('')
  const { user } = useUser()
  const { arenaId } = useArena()
  const [userData, setUserData] = useState(null)
  const [arenaData, setArenaData] = useState({ city: '' })
  const [selectedSports, setSelectedSports] = useState([])
  const [isHolidayEnabled, setHolidayEnabled] = useState(false)

  const handleHolidayToggle = () => {
    setHolidayEnabled(!isHolidayEnabled)
  }

  const handleCheckboxChange = (e, sportId, sportName) => {
    const isChecked = e.target.checked

    setSelectedSports((prevSelected) => {
      let updatedSelected

      if (!Array.isArray(prevSelected)) {
        // If not an array, initialize it as an empty array
        updatedSelected = isChecked ? [sportId] : []
      } else {
        updatedSelected = isChecked
          ? [...prevSelected, sportId]
          : prevSelected.filter((id) => id !== sportId)
      }

      return updatedSelected
    })

    setArenaData((prevData) => {
      const updatedSports = isChecked
        ? { ...prevData.sports, [sportId]: sportName }
        : Object.entries(prevData.sports || {}).reduce((acc, [id, name]) => {
            if (id !== sportId) {
              acc[id] = name
            }
            return acc
          }, {})

      return { ...prevData, sports: updatedSports }
    })
  }

  const options = cityData.map((city) => ({
    value: city.city,
    label: city.city,
  }))

  const firestore = getFirestore(app)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    setProfileImage(URL.createObjectURL(file))
  }

  useEffect(() => {
    const fetchUserData = async () => {
      // Assuming 'users' is the collection name in your Firestore
      const usersRef = collection(firestore, 'arenaowners')

      // Query to get the specific user data based on user.uid
      const userQuery = query(usersRef, where('userId', '==', user.uid))

      try {
        const querySnapshot = await getDocs(userQuery)

        if (!querySnapshot.empty) {
          // Assuming you expect only one document per user.uid
          const userData = querySnapshot.docs[0].data()
          setUserData(userData)
        } else {
          console.log('No user data found for the user.')
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message)
      }
    }

    fetchUserData()
  }, [user.uid])

  useEffect(() => {
    const fetchArenaData = async () => {
      // 'arenas' is the collection name in Firestore
      const arenasRef = collection(firestore, 'arenas')

      // Query to get the specific arena data based on arenaId
      const arenaQuery = query(arenasRef, where('arenaId', '==', arenaId))

      try {
        const querySnapshot = await getDocs(arenaQuery)

        if (!querySnapshot.empty) {
          // expect only one document per arenaId
          const arenaData = querySnapshot.docs[0].data()
          console.log('Fetched arenaData:', arenaData)
          setArenaData(arenaData)

          // Fetch sports data from arenaData.sports
          if (arenaData.sports) {
            setSelectedSports(Object.keys(arenaData.sports))
          }
        } else {
          console.log('No arena data found for the arenaId.')
        }
      } catch (error) {
        console.error('Error fetching arena data:', error.message)
      }
    }

    fetchArenaData()
  }, [arenaId])

  const updateUserData = async () => {
    const userRef = doc(firestore, 'arenaowners', userData.userId) // you have 'id' in your userData
    const arenaRef = doc(firestore, 'arenas', arenaData.arenaId)
    try {
      await updateDoc(userRef, {
        owner: {
          firstName: userData.owner.firstName,
          lastName: userData.owner.lastName,
        },

        email: userData.email,
        phone: userData.phone,
      })

      await updateDoc(arenaRef, {
        name: arenaData.name,
        address: arenaData.address,
        city: arenaData.city,
        sports: arenaData.sports,
        holiday: isHolidayEnabled,
      })
      alert('User and Arena data updated successfully.')
    } catch (error) {
      alert('Error in updating data:', error.message)
    }
  }
  const [errors, setErrors] = useState({})

  const validateFirstName = () => {
    const regex = /^[A-Za-z]+$/
    if (!userData.owner.firstName || !regex.test(userData.owner.lastName)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        firstName:
          'Please enter a valid first name with only English alphabets.',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        firstName: undefined,
      }))
    }
  }

  const validateLastName = () => {
    const regex = /^[a-zA-Z ]+$/
    if (!userData.owner.lastName || !regex.test(userData.owner.lastName)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        lastName: 'Please enter a valid last name with only English alphabets.',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        lastName: undefined,
      }))
    }
  }

  const validateEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!userData.email || !regex.test(userData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Please enter a valid email address.',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: undefined,
      }))
    }
  }

  const validatePhoneNumber = () => {
    const regex = /^\d{11}$/
    if (!userData.phone || !regex.test(userData.phone)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone: 'Please enter a valid 11-digit phone number.',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phone: undefined,
      }))
    }
  }

  const handleFirstNameChange = (e) => {
    setUserData({ ...userData, firstName: e.target.value })
    validateFirstName()
  }

  const handleLastNameChange = (e) => {
    setUserData({ ...userData, lastName: e.target.value })
    validateLastName()
  }

  const handleEmailChange = (e) => {
    setUserData({ ...userData, email: e.target.value })
    validateEmail()
  }

  const handlePhoneNumberChange = (e) => {
    setUserData({ ...userData, phone: e.target.value })
    validatePhoneNumber()
  }

  return (
    <Layout>
      {arenaData && userData && (
        <Container className='mt-3'>
          <h2 className='text-1xl font-bold mb-4 text-center'>Admin Profile</h2>

          <Row>
            <Col md={4} className='text-center'>
              <text
                style={{
                  fontSize: '20px',
                  fontWeight: 'lighter',
                }}
              >
                Arena Pictures
              </text>
              {arenaData.arenaPics && arenaData.arenaPics.length > 0 ? (
                <Carousel>
                  {arenaData.arenaPics.map((pic, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={pic}
                        alt={`Arena Pic ${index + 1}`}
                        className='d-block w-100 img-fluid rounded mt-3'
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <p>No arena pictures available.</p>
              )}
            </Col>
            <Col md={8}>
              <text
                style={{
                  fontSize: '20px',
                  fontWeight: 'lighter',
                }}
              >
                Admin Information
              </text>
              <Form>
                <Row className='mb-3'>
                  <Col>
                    <text>First Name</text>
                    <Form.Control
                      value={userData.owner.firstName || ''}
                      onChange={handleFirstNameChange}
                      onBlur={validateFirstName}
                    />
                    {errors.firstName && (
                      <p style={{ color: 'red' }}>{errors.firstName}</p>
                    )}
                  </Col>
                  <Col>
                    <text>Last Name</text>
                    <Form.Control
                      value={userData.owner.lastName || ''}
                      onChange={handleLastNameChange}
                      onBlur={validateLastName}
                    />
                    {errors.lastName && (
                      <p style={{ color: 'red' }}>{errors.lastName}</p>
                    )}
                  </Col>
                </Row>
                <Row className='mb-3'>
                  <Col>
                    <text>Email</text>
                    <Form.Control
                      type='email'
                      value={userData.email || ''}
                      onChange={handleEmailChange}
                      onBlur={validateEmail}
                    />
                    {errors.email && (
                      <p style={{ color: 'red' }}>{errors.email}</p>
                    )}
                  </Col>
                  <Col>
                    <text>Phone Number</text>
                    <Form.Control
                      value={userData.phone || ''}
                      onChange={handlePhoneNumberChange}
                      onBlur={validatePhoneNumber}
                    />
                    {errors.phone && (
                      <p style={{ color: 'red' }}>{errors.phone}</p>
                    )}
                  </Col>
                </Row>
                <hr />
                <text
                  style={{
                    fontSize: '20px',
                    fontWeight: 'lighter',
                  }}
                >
                  Arena Information
                </text>
                <Row>
                  <Col>
                    <text>Arena Name</text>
                    <Form.Control
                      className='mb-3'
                      value={arenaData.name || ''}
                      onChange={(e) =>
                        setArenaData({ ...arenaData, name: e.target.value })
                      }
                    />
                  </Col>
                  <Col>
                    <text>Arena Address</text>
                    <Form.Control
                      className='mb-3'
                      value={arenaData.address || ''}
                      onChange={(e) =>
                        setArenaData({ ...arenaData, address: e.target.value })
                      }
                    />
                  </Col>
                </Row>
                <Row className='mb-3'>
                  <Col>
                    <text>Arena City</text>
                    <Select
                      placeholder='Select City'
                      value={
                        options.find(
                          (option) => option.value === arenaData.city
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        setArenaData({
                          ...arenaData,
                          city: selectedOption.value,
                        })
                      }
                      options={options}
                    />
                  </Col>
                  <Col>
                    <p>Choose your arena location here!</p>
                    <Link to='/map' style={{ textDecoration: 'none' }}>
                      Google Map
                    </Link>
                  </Col>
                </Row>

                <Row className='mb-3'>
                  <Col>
                    <text>Holiday</text>
                    <Form.Check
                      type='switch'
                      id='holiday-switch'
                      label={isHolidayEnabled ? 'Enabled' : 'Disabled'}
                      checked={isHolidayEnabled}
                      onChange={handleHolidayToggle}
                    />
                  </Col>
                </Row>

                <Container>
                  <Row>
                    <p>Select Sports</p>
                    {Object.entries(arenaData.sports || {}).map(
                      ([sportId, sportName]) => (
                        <Col key={sportId}>
                          <Form.Check
                            type='checkbox'
                            id={`sport-checkbox-${sportId}`}
                            label={sportName}
                            checked={
                              Array.isArray(selectedSports) &&
                              selectedSports.includes(sportId)
                            }
                            onChange={(e) =>
                              handleCheckboxChange(e, sportId, sportName)
                            }
                          />
                        </Col>
                      )
                    )}
                  </Row>

                  {[0, 1, 2, 3].map((rowIndex) => (
                    <Row key={rowIndex}>
                      {Object.keys(sportsList)
                        .slice(rowIndex * 2, (rowIndex + 1) * 2)
                        .map((sportId) => {
                          const sportName = sportsList[sportId].name
                          if (
                            !arenaData.sports ||
                            !Object.values(arenaData.sports).includes(sportName)
                          ) {
                            return (
                              <Col key={sportId}>
                                <Form.Check
                                  type='checkbox'
                                  id={`sport-checkbox-${sportId}`}
                                  label={sportName}
                                  checked={
                                    Array.isArray(selectedSports) &&
                                    selectedSports.includes(sportId)
                                  }
                                  onChange={(e) =>
                                    handleCheckboxChange(e, sportId, sportName)
                                  }
                                />
                              </Col>
                            )
                          }
                          return null
                        })}
                    </Row>
                  ))}
                </Container>

                <div style={{ textAlign: 'center' }}>
                  <Button
                    variant='primary'
                    onClick={updateUserData}
                    className='text-center mt-3'
                  >
                    Update
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      )}
    </Layout>
  )
}

export default ProfilePage
