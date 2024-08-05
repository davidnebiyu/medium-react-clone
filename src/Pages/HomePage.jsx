import React from 'react'
import blogvector from '../assets/blog-vector.png'
import { useDispatch, useSelector } from 'react-redux'
import { signout } from '../Firebasem/AuthF' 
import { uiAction } from '../Store/Store'
import Signin from '../Components/Signin'

function HomePage() {
  const currUser = useSelector((state)=>state.auth.currentUser)
  const dispatch = useDispatch()    
  return (
    <>
      {!currUser ? 
        <header className='bg-slate-200 overflow-hidden'>
        <div className="wrapper px-8 flex flex-col gap-10 h-[calc(100vh-70px)] justify-center relative">
          <p className='font-title text-8xl'>Human <br />
          stories & ideas</p>
          <p className='text-2xl'>A place to read, write, and deepen your understanding </p>
          <button onClick={()=>{dispatch(uiAction.setModalElement(Signin))}} className='mediumBtn !px-8 text-xl transition-all hover:bg-green-600'>Get Started</button>
          <div className="absolute right-0 w-[640px] left-[700px]">
            <img src={blogvector} alt="" title='Image By freepik'/>
          </div>
        </div>
      </header>
      :
      <button onClick={()=>{signout()}}>Sign Out</button>
      }

    </>
  )
}

export default HomePage