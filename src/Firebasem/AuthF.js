import React from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from './Store'


export const signupEmail = ({email, password})=>{
    return createUserWithEmailAndPassword(auth, email, password)
}

export const signinEmail = ({email, password})=>{
    return signInWithEmailAndPassword(auth, email, password)
}

const provider = new GoogleAuthProvider()
export const signinGoogle = ()=>{
    return signInWithPopup(auth, provider)
}

export const signout = ()=>{
    return signOut(auth)
}