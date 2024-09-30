import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { uiAction } from '../Store/Store';
import Signin from './Signin';
import { checkFollowStat } from '../Hooks/AuthValidation';

function FollowBtn({user1, user2, className, onSetFollowing, onSetFollowers, onSetFollowingSize, onClicked,...props}) {    

    const currentUser = useSelector((state) => state.auth.currentUser);
    const dispatch = useDispatch()

    const {loading, error, stat, followingSize, checkStat} = checkFollowStat()

    const clickHandler = async(e)=>{
        e.preventDefault()
        if(currentUser){
            await checkStat({user1ID:user1, user2ID:user2, toggle:true, onSyncFollowers:onSetFollowers, onSyncFollowing:onSetFollowing, onSyncFollowingSize:onSetFollowingSize})
            onClicked && onClicked();            
        }else{
            dispatch(uiAction.setModalElement(Signin));
        }

    }

    useEffect(()=>{
        checkStat({user1ID:user1, user2ID:user2})
    }, [user1, user2])

  return (
    <button disabled={loading} className={`mediumBtn ${className} ${(stat == true) ? '!bg-transparent !text-inherit !border border-black1': ''}`} onClick={(e)=>{clickHandler(e)}} {...props}>{stat == true && "Following"} {(stat == false || !currentUser) && "Follow"}</button>
  )
}

export default FollowBtn