import React, { createContext, useContext, useState } from 'react'

const ArenaContext = createContext()

export const ArenaProvider = ({ children }) => {
  const [arenaId, setArenaId] = useState(null)

  return (
    <ArenaContext.Provider value={{ arenaId, setArenaId }}>
      {children}
    </ArenaContext.Provider>
  )
}

export const useArena = () => {
  const context = useContext(ArenaContext)
  if (!context) {
    throw new Error('useArena must be used within an ArenaProvider')
  }
  return context
}
