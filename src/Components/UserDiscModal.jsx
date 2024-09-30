import React, { useEffect, useRef, useState } from 'react'
import blogvector from '../assets/blog-vector.png'
import { auth } from '../Firebasem/Store';
import FollowBtn from './FollowBtn';
import { readData } from '../Firebasem/FirestoreF';
import profilepic from "../assets/profilepic.png";
import { useSelector } from 'react-redux';


function UserDiscModal({mousePos, bloggerID, className, ...props}) {

    // Get the total height of the document
    const pageHeight = document.documentElement.clientHeight;
    const pageWidth = document.documentElement.clientWidth;

    // Calculate the distance from the bottom of the page
    const distanceFromBottom = mousePos.clientY ? pageHeight - mousePos.clientY : 500;
    const distanceFromRight = mousePos.clientX ? pageWidth - mousePos.clientX : 301;

    const isLogin = auth.currentUser;
    const isCurrentUser = auth.currentUser && auth.currentUser.uid == bloggerID;

    const currentUser = useSelector((state)=>state.auth.currentUser)

    const handleFollow = (e)=>{
      e.preventDefault()
    }

    const [userData, setUserData] = useState({name:"", bio:"", userImage:"", followerSize:null})
    const [followData, setFollowData] = useState({hasFollowed:null, }) 

    const [followAction, setFollowAction] = useState(null)

    const onFollowChange = ()=>{
      console.log(8888);
      
      followAction ? setFollowAction(false) : setFollowAction(true)
    }

    const getUserInfo = async ()=>{
      try {
        const data = await readData({collectionName:"users", Id:bloggerID})        
        setUserData({
          name:data.data().name,
          bio:data.data().bio,
          userImage:data.data().userImage,
          followerSize:data.data().followers && data.data().followers.length > 0 ? data.data().followers.length : 0
        })

      } catch (error) {
        console.log(error);
        
      }
    }
    
    useEffect(()=>{
      bloggerID &&
      getUserInfo()
    },[bloggerID, followAction])
    
  return (
    <>
    
        <div className={`absolute ${distanceFromBottom > 300 ? 'top-6' : 'bottom-6'} ${distanceFromRight < 300 ? 'right-0' : 'left-0'}  bg-white  flex flex-col gap-3 w-[270px] border shadow-2xl rounded-sm p-4 z-10 ${className}`}>
            <div className="flex justify-between gap-4 items-center">
                <div className="w-[70px]">
                  <img src={userData && userData.userImage ? userData.userImage : profilepic} className='w-full rounded-[50%] object-cover object-center' alt="" />
                  
                </div>
                {!isCurrentUser && <FollowBtn className="!h-fit" user1={currentUser} user2={bloggerID} onClicked={onFollowChange}/>}
            </div>

            <p className='font-bold'>{userData && userData.name}</p>
            <p>{userData && userData.followerSize} followers</p>

            <p className='line-clamp-4'>{userData && userData.bio}</p>

        </div>

    </>
  )
}

export default UserDiscModal