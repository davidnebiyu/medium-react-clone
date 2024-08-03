import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uiAction } from '../Store/Store'

function Backdrop() {
    const isBackdrop = useSelector((state)=>state.ui.backdropStat)
    const dispatch = useDispatch()
  return (
    <>
        <div  onClick={()=>{dispatch(uiAction.removeModalElement())}} className={` z-[200] fixed top-0 left-0 h-full w-full bg-[#ffffffea] `}>
        </div>
    </>
  )
}

export default Backdrop