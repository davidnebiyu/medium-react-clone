import React from 'react'
import NavBar from './NavBar'
import { Outlet } from 'react-router-dom'

function RootPage() {
  return (
    <>
        <NavBar/>
        <div className="mt-[70px]"> <Outlet/></div>
       
    
    </>
  )
}

export default RootPage