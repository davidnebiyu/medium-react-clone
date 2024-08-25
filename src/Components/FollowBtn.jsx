import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { uiAction } from '../Store/Store';
import Signin from './Signin';

function FollowBtn({userID, className, ...props}) {

    const currentUser = useSelector((state) => state.auth.currentUser);
    const dispatch = useDispatch()

    const clickHandler = (e)=>{
        e.preventDefault()
        if(currentUser){
            if(currentUser != userID ){
                alert("follow action")
            }
        }else{
            dispatch(uiAction.setModalElement(Signin));
        }

    }

  return (
    <button className={`mediumBtn ${className}`} onClick={(e)=>{clickHandler(e)}} {...props}>Follow</button>
  )
}

export default FollowBtn