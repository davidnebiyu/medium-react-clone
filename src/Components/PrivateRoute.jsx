import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

function PrivateRoute({from}) {
    const currentUser = useSelector((state)=>state.auth.currentUser)
    
    if(from == 'out'){
        return currentUser ? <Outlet/> : <Navigate to="/"/>
    }


    if(from == 'in'){
      return currentUser ? <Navigate to="/"/> : <Outlet/>  
    }


    if(!from){
      return currentUser ? <Outlet/> : <Navigate to="/"/>
    }
}

export default PrivateRoute