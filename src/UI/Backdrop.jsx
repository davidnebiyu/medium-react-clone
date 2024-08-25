import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uiAction } from '../Store/Store'

function Backdrop({onClick, className, transparent, disable}) {
    const dispatch = useDispatch()
    const clickHandler = ()=>{
      if(disable){
        return false
      }
      onClick ? onClick() : null
    }
  return (
    <>
        { <div  onClick={clickHandler} className={`z-[200] fixed top-0 left-0 h-full w-full ${transparent == true && 'bg-transparent'} ${transparent == "semi" ? 'bg-[#00000040]' : 'bg-[#ffffffea]'} ${className}`}>
        </div>}
    </>
  )
}

export default Backdrop