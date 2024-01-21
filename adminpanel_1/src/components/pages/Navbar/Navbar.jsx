import React, { useState, useEffect } from 'react'
import { Alert, Badge, Container, Navbar, Nav, Modal } from 'react-bootstrap'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Link } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Person'
import { useUser } from '../../../UserContext'
import { useArena } from '../../../arenaProvider'
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore'
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

const NotificationSection = ({ notifications, markAsRead }) => {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  )
  return (
    <Container className='mt-3'>
      {unreadNotifications.map((notification) => {
        const timestamp = notification.timestamp.toDate()

        return (
          <Alert
            key={notification.id}
            variant={notification.read ? 'secondary' : 'info'}
            className='my-2'
          >
            <strong>{notification.sender}</strong>
            <span className='ms-2'>{notification.message}</span>
            <div className='small text-muted mt-1'>
              {timestamp.toLocaleString()}
            </div>
            {!notification.read && (
              <Badge
                className='ms-2 mark-as-read'
                pill
                style={{
                  backgroundColor: 'lightblue',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'lightblue'
                }}
                onClick={() => markAsRead(notification.id)}
              >
                Mark as Read
              </Badge>
            )}
          </Alert>
        )
      })}
    </Container>
  )
}

const NotificationsPage = ({ show, handleClose, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([])
  const { arenaId } = useArena()
  const firestore = getFirestore(app)
  const notificationsRef = collection(firestore, 'notifications')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(notificationsRef, where('receiverId', '==', arenaId)),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setNotifications(data)
      }
    )

    return () => unsubscribe()
  }, [arenaId, notificationsRef])

  const markAsRead = async (notificationId) => {
    const notificationDocRef = doc(notificationsRef, notificationId)

    try {
      await updateDoc(notificationDocRef, {
        read: true,
      })

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      )

      setUnreadCount((prevUnreadCount) => Math.max(0, prevUnreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Notifications</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NotificationSection
          notifications={notifications}
          markAsRead={markAsRead}
        />
      </Modal.Body>
    </Modal>
  )
}

const NavbarNotification = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications)
    setUnreadCount(0)
  }

  useEffect(() => {
    document.title =
      unreadCount > 0 ? `(${unreadCount}) Notifications` : 'React App'
  }, [unreadCount, showNotifications])

  useEffect(() => {
    // Update the unread count based on the number of unread notifications
    const newUnreadCount = notifications.reduce(
      (count, notification) => (!notification.read ? count + 1 : count),
      0
    )
    setUnreadCount(newUnreadCount)
  }, [notifications])

  return (
    <>
      <Navbar
        expand='lg'
        style={{
          backgroundColor: 'rgb(245, 242, 242)',
          height: '70px',
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          zIndex: '1',
        }}
      >
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse
          id='basic-navbar-nav'
          className='d-flex justify-content-end'
        >
          <Nav className='ml-auto'>
            <Nav.Link onClick={handleNotificationsClick}>
              <NotificationsIcon />
              {unreadCount > 0 && (
                <Badge
                  pill
                  variant='danger'
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    color: 'red',
                  }}
                >
                  {unreadCount}
                </Badge>
              )}
            </Nav.Link>
            <Nav.Link as={Link} to='/profile'>
              <PersonIcon />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <NotificationsPage
        show={showNotifications}
        handleClose={() => setShowNotifications(false)}
        setUnreadCount={setUnreadCount}
        setNotifications={setNotifications}
      />
    </>
  )
}

export default NavbarNotification
