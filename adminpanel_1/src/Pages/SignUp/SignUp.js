import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { useUser } from '../../UserContext'
import {
  addDoc,
  collection,
  updateDoc,
  query,
  getDoc,
  where,
  getDocs,
} from 'firebase/firestore'

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

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
  })

  const { setUser } = useUser()
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const auth = getAuth()
  const firestore = getFirestore(app)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    // Validation for First Name and Last Name (English alphabets only)
    const onlyEnglishAlphabets = /^[a-zA-Z]+$/

    if (
      (name === 'firstName' || name === 'lastName') &&
      value.trim() !== '' &&
      !onlyEnglishAlphabets.test(value)
    ) {
      // Display an error or handle the validation as needed
      alert('must contain only English alphabets')
      return
    }
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('Password:', formData.password)
    console.log('Confirm Password:', formData.confirmPassword)

    const newErrors = {}

    if (!formData.firstName || formData.firstName.trim() === '') {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName || formData.lastName.trim() === '') {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required'
    }
    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      newErrors.phoneNumber = 'Phone number is required'
    }
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'Password is required'
    }

    const phoneRegex = /^[0-9]{11}$/
    if (
      formData.phoneNumber &&
      formData.phoneNumber.trim() !== '' &&
      !phoneRegex.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = 'Invalid phone number'
    }
    // Check if both password and confirm password are entered
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'Please fill the all fields'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else {
      // Clear the error if the password is valid
      delete newErrors.password
    }

    if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
      newErrors.confirmPassword = 'Confirm Password is required'
    } else if (
      formData.password &&
      formData.confirmPassword &&
      formData.password.trim() !== formData.confirmPassword.trim()
    ) {
      newErrors.confirmPassword = 'Passwords do not match'
    } else {
      // Clear the error if passwords match
      delete newErrors.confirmPassword
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        )

        const user = userCredential.user

        // Create an arena document in the 'arenas' collection
        const arenaData = {
          complete: false,
          arenaId: '', // will be set after creating the arena
          userId: user.uid,
          address: '',
          approved: false, // boolean field
          city: '',
          facilities: [], // array field
          holiday: false, // boolean field
          location: {
            latitude: 0, // Replace with the actual latitude
            longitude: 0, // Replace with the actual longitude
          },
          name: '',
          slots: [], // array field
          arenaPics: [], // array field
          rating: [], // array field
          sports: [], // assuming sports is a string, change if it's an array
          owner: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          phone: formData.phoneNumber,
          email: formData.email,
        }

        // Set arena data in Firestore
        const arenaRef = await addDoc(
          collection(firestore, 'arenas'),
          arenaData
        )

        // Get the automatically generated arena ID and update arenaData
        const newArenaId = arenaRef.id
        const updatedArenaData = { ...arenaData, arenaId: newArenaId }

        // Update the arena document with the newArenaId
        await setDoc(doc(firestore, 'arenas', newArenaId), updatedArenaData)

        const arenaOwnerData = {
          userId: user.uid,
          owner: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          phone: formData.phoneNumber,
          email: formData.email,
        }

        await setDoc(doc(firestore, 'arenaowners', user.uid), arenaOwnerData)

        setUser({
          uid: user.uid,
          // ... (any other user data you want to store)
        })

        alert('Signup successfully!')
        navigate('/login')
      } catch (error) {
        console.log(error.message)
      }
    } else {
      if (newErrors.password) {
        alert(newErrors.password)
      }
      setErrors(newErrors)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
          width: '800px',
          padding: '30px',
          borderRadius: '20px',
        }}
      >
        <Row>
          <Col md={{ span: 10, offset: 1 }}>
            <h2
              className='text-1xl font-bold mb-4 text-center'
              style={{ color: 'hwb(227 10% 67%)' }}
            >
              Sign Up
            </h2>
            <Form onSubmit={handleSubmit}>
              <Row style={{ marginTop: '2rem' }}>
                <Col>
                  <Form.Group controlId='firstName'>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      isInvalid={errors.firstName}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='lastName'>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      isInvalid={errors.lastName}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{ marginTop: '1rem' }}>
                <Col>
                  <Form.Group controlId='email'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type='email'
                      name='email'
                      value={formData.email}
                      placeholder='name@gmail.com'
                      onChange={handleInputChange}
                      isInvalid={errors.email}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='phoneNumber'>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type='text'
                      name='phoneNumber'
                      placeholder='03xx'
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      isInvalid={errors.phoneNumber}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.phoneNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row style={{ marginTop: '1rem' }}>
                <Col>
                  <Form.Group controlId='password'>
                    <Form.Label>Password</Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        value={formData.password}
                        onChange={handleInputChange}
                        isInvalid={errors.password}
                      />
                      {showPassword ? (
                        <VisibilityIcon
                          onClick={togglePasswordVisibility}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <VisibilityOffIcon
                          onClick={togglePasswordVisibility}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                          }}
                        />
                      )}
                    </div>
                    <Form.Control.Feedback type='invalid'>
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId='confirmPassword'>
                    <Form.Label>Confirm Password</Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        isInvalid={errors.confirmPassword}
                      />
                      {showPassword ? (
                        <VisibilityIcon
                          onClick={togglePasswordVisibility}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <VisibilityOffIcon
                          onClick={togglePasswordVisibility}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                          }}
                        />
                      )}
                    </div>
                    <Form.Control.Feedback type='invalid'>
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <div style={{ textAlign: 'center' }}>
                <Button
                  variant='primary'
                  type='submit'
                  style={{ marginTop: '2rem' }}
                >
                  Sign Up
                </Button>
              </div>
            </Form>
            <div
              style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              Already have an account?{' '}
              <Link to='/login' style={{ textDecoration: 'none' }}>
                Login
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default SignUp
