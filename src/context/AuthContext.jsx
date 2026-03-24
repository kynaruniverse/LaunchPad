import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (id) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      setProfile(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, username, fullName) => {
    // 1. Create the auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('Signup failed')
  
    // 2. Create the profile (must succeed, else rollback auth user)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username, full_name: fullName })
      if (profileError) {
        // If profile creation fails (e.g., duplicate username), sign out the user
        await supabase.auth.signOut()
        if (profileError.code === '23505') {
          throw new Error('Username already taken. Please choose another.')
        }
        throw new Error('Could not create profile. Please try again.')
      }
    } catch (err) {
      // Ensure the auth user is logged out if anything goes wrong
      await supabase.auth.signOut()
      throw err
    }
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = () => { if (user) loadProfile(user.id) }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
