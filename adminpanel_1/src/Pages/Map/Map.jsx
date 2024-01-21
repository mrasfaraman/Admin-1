import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { auth } from '../../firebase'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { useArena } from '../../arenaProvider'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import { deleteDoc, doc, setDoc, getDoc, addDoc } from 'firebase/firestore'
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

function Map() {
  let map
  let marker
  let searchBox
  const auth = getAuth()
  const firestore = getFirestore(app)
  const { arenaId } = useArena()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const existingScript = document.getElementById('google-maps-script')

    if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBPjBHXmDnGvJULgTBQFScAlMCqGZUe16g&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script'
      window.initMap = initMap

      document.head.appendChild(script)

      return () => {
        // Clean up the script and the global initMap function when the component is unmounted
        delete window.initMap
        document.head.removeChild(script)
      }
    } else {
      // If the script is already loaded, just call initMap
      initMap()
    }
  }, [])

  function initMap() {
    map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 30.3753, lng: 69.3451 },
      zoom: 6,
    })

    // Add a click event listener to the map
    map.addListener('click', handleMapClick)

    // Create the search box and link it to the UI element.
    const input = document.getElementById('pac-input')
    searchBox = new window.google.maps.places.SearchBox(input)
    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input)

    // Bias the SearchBox results towards the current map's viewport.
    map.addListener('bounds_changed', function () {
      searchBox.setBounds(map.getBounds())
    })

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', handlePlacesChanged)
  }

  function handleMapClick(event) {
    // Clear the previous marker, if any
    if (marker) {
      marker.setMap(null)
    }

    // Create a new marker at the clicked location
    marker = new window.google.maps.Marker({
      position: event.latLng,
      map: map,
      draggable: true,
    })

    // Update the selectedLocation state
    const selectedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    }
    setSelectedLocation(selectedLocation)

    // Update the database with the new latitude and longitude
  }
  const arenaRef = doc(firestore, 'arenas', arenaId)
  async function updateDatabaseWithLocation(location) {
    try {
      await updateDoc(arenaRef, {
        location: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
      })

      alert('Location updated in the database.')
      navigate('/profile')
    } catch (error) {
      alert('Error updating location in the database:', error.message)
    }
  }

  function handleCancel() {
    // Navigate back to the previous page or perform other cancel actions
    navigate('/profile')
    console.log('Cancelled')
  }

  function handleDone() {
    // Save the selectedLocation to the server
    alert('Your location is selected')
    console.log('Selected Location:', selectedLocation)

    // Navigate back to the previous page or perform other done actions
    navigate('/profile')
    console.log('Done')
  }

  function handlePlacesChanged() {
    const places = searchBox.getPlaces()

    if (places.length === 0) {
      return
    }

    // For each place, get the icon, name, and location.
    const bounds = new window.google.maps.LatLngBounds()
    places.forEach((place) => {
      if (!place.geometry) {
        console.log('Returned place contains no geometry')
        return
      }

      // Create a marker for each place.
      marker = new window.google.maps.Marker({
        map,
        title: place.name,
        position: place.geometry.location,
        draggable: true,
      })

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport)
      } else {
        bounds.extend(place.geometry.location)
      }

      // Update the selectedLocation state
      setSelectedLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      })
    })

    map.fitBounds(bounds)
  }

  return (
    <div>
      <div
        id='map'
        style={{
          height: '90vh',
          width: '100%',
        }}
      ></div>
      <Form.Control
        id='pac-input'
        type='text'
        placeholder='Search for a place'
        style={{
          position: 'absolute',

          top: '10px',
          left: '10px',
          zIndex: 1,
        }}
      />
      {selectedLocation && (
        <div
          style={{
            height: '60px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          <Button variant='danger' size='lg' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant='success'
            size='lg'
            onClick={updateDatabaseWithLocation}
          >
            Done
          </Button>
        </div>
      )}
    </div>
  )
}

export default Map
