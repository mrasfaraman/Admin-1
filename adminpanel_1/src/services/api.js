import { doc, getDoc, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
export const getAreanaRatings = async (arenaId) => {
  try {
    const docRef = doc(db, 'arenas', arenaId)
    const querySnapshot = await getDoc(docRef)
    const data = querySnapshot.data()
    const arenaRating = data.rating

    return arenaRating
  } catch (error) {
    console.error('Error fetching arenas:', error)
    throw error
  }
}
