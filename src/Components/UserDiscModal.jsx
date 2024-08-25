import React, { useEffect, useRef, useState } from 'react'
import blogvector from '../assets/blog-vector.png'
import { auth } from '../Firebasem/Store';
import FollowBtn from './FollowBtn';

function UserDiscModal({mousePos, userID, className, ...props}) {

    // Get the total height of the document
    const pageHeight = document.documentElement.clientHeight;
    const pageWidth = document.documentElement.clientWidth;

    // Calculate the distance from the bottom of the page
    const distanceFromBottom = mousePos.clientY ? pageHeight - mousePos.clientY : 500;
    const distanceFromRight = mousePos.clientX ? pageWidth - mousePos.clientX : 301;

    const isLogin = auth.currentUser;
    const isCurrentUser = auth.currentUser && auth.currentUser.uid == userID;

    const handleFollow = (e)=>{
      e.preventDefault()
    }
    
    
  return (
    <>
    
        <div className={`absolute ${distanceFromBottom > 300 ? 'top-6' : 'bottom-6'} ${distanceFromRight < 300 ? 'right-0' : 'left-0'}  bg-white  flex flex-col gap-3 w-[270px] border shadow-2xl rounded-sm p-4 z-10 ${className}`}>
            <div className="flex justify-between gap-4 items-center">
                <div className="w-[70px]">
                  <img src={blogvector} className='w-full rounded-[50%] object-cover object-center' alt="" />
                  
                </div>
                {!isCurrentUser && <FollowBtn className="!h-fit" userID="1"/>}
            </div>

            <p className='font-bold'>Dawit Nebiyu</p>
            <p>297 followers</p>

            <p className='line-clamp-4'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Asperiores, unde eaque, iste, repellat alias labore et tempora architecto distinctio accusamus voluptates voluptatem consequatur earum impedit nostrum quam vero optio blanditiis.</p>

        </div>

    </>
  )
}

export default UserDiscModal