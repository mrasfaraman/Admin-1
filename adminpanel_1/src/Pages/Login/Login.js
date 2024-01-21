import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { AuthContext } from '../../context/AuthContext'
import { useUser } from '../../UserContext'
import { getFirestore, getDocs, collection } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { useArena } from '../../arenaProvider'
import { query, where, updateDoc } from 'firebase/firestore'

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

function Login() {
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useUser()
  const { setArenaId } = useArena()

  const auth = getAuth()
  const firestore = getFirestore(app)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const navigate = useNavigate()

  const { dispatch } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault()

    // Clear any previous error messages
    setEmailError(null)
    setPasswordError(null)
    setError(null)

    // Validate email
    if (!email) {
      setEmailError('Email is required.')
      return
    }

    // Validate password
    if (!password) {
      setPasswordError('Invalid password.')
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      setUser({
        uid: user.uid,
        // ... (any other user data you want to store)
      })

      // Fetch arena ID based on user ID
      const arenasCollectionRef = collection(firestore, 'arenas')
      const querySnapshot = await getDocs(
        query(arenasCollectionRef, where('userId', '==', user.uid))
      )

      let foundArenaId = null

      querySnapshot.forEach((doc) => {
        const arenaData = doc.data()
        foundArenaId = arenaData.address
      })

      // Check if the user has an associated arena
      if (foundArenaId) {
        // Existing user, navigate to home page
        navigate('/')
      } else {
        // New user, navigate to the welcome page
        navigate('/welcomePage')
      }

      dispatch({ type: 'LOGIN', payload: user })
    } catch (error) {
      // Display the "Wrong email or password" message when login fails
      setError('Wrong email or password!')
    }
  }

  const handleForgotPassword = () => {
    // Validate email before sending the reset email
    if (!email) {
      setEmailError('Email is required for password reset.')
      return
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent successfully
        // You may want to show a success message to the user
        alert('Password reset email sent successfully.')
      })
      .catch((error) => {
        // Handle errors, e.g., if the email is not found
        alert('Error sending password reset email:')
      })
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
          width: '600px',
          padding: '30px',
          borderRadius: '20px',
        }}
      >
        <Row>
          <Col md={{ span: 8, offset: 2 }}>
            <h2
              className='text-1xl font-bold mb-4 text-center'
              style={{ color: 'hwb(227 10% 67%)' }}
            >
              Login
            </h2>

            <Form onSubmit={handleLogin}>
              <Row style={{ marginTop: '2rem' }}>
                <Col>
                  <Form.Group controlId='email'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type='email'
                      onChange={(e) => setEmail(e.target.value)}
                      isInvalid={emailError}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {emailError}
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
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={passwordError}
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
                      {passwordError}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <div style={{ marginBottom: '1rem' }}>
                  <span
                    style={{
                      color: 'blue',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'flex',
                      marginLeft: '227px',
                    }}
                    onClick={handleForgotPassword}
                  >
                    Forget password?
                  </span>
                </div>
              </Row>
              <div style={{ textAlign: 'center' }}>
                <Button variant='primary' type='submit'>
                  Login
                </Button>
              </div>
              {error && <span style={{ color: 'red' }}>{error}</span>}
            </Form>

            <div
              style={{
                marginTop: '1rem',
                marginBottom: '1rem',
              }}
            >
              <span>
                Don't have an account?{' '}
                <Link
                  to='/signup'
                  style={{
                    color: 'blue',
                    textDecoration: 'none',
                  }}
                >
                  Create an account
                </Link>
              </span>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login
