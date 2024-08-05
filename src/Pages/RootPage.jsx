import React from 'react'
import NavBar from '../Components/NavBar'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loading from '../UI/Loading'


function RootPage() {
  const authLoading = useSelector((state)=>state.ui.authLoading)

  return (
    <>
      {
        authLoading ? <Loading/> : 
        <><NavBar /><div className="mt-[70px]"> <Outlet /></div></>
      }
       
    
    </>
  )
}

export default RootPage