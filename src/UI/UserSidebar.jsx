import React, { useState } from 'react'
import { CgProfile } from "react-icons/cg";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { GrDocumentText } from "react-icons/gr";
import { NavLink } from 'react-router-dom'
import { forwardRef } from 'react';
import {signout} from '../Firebasem/AuthF'
import DialogModal from '../Components/DialogModal';
import { useSelector } from 'react-redux';


const UserSidebar = forwardRef(({openCont}, ref)=>{

    const [signOutDiagDisp, setSignOutDiagDisp] = useState(false)
    const currentUsername = useSelector((state) => state.auth.currentUserData ? state.auth.currentUserData.username : null);

    const signOut = async()=>{
        await signout()
    }

  return (
    <>
        
        <div  ref={ref} className=" absolute top-[calc(100%-0.5rem)] right-[1rem] z-[500] shadow-md rounded-md w-[280px] bg-white border flex flex-col py-[0.5rem]">
                <ul  className=' text-[0.85rem] [&:not(:last-child)]:border-b border-slate-200  py-3'>
                    <li >
                        <NavLink to={`/${currentUsername}`} onClick={(e)=>{openCont(false)}}   className={ ({isActive})=> `${isActive ? 'opacity-100' : 'opacity-80'}  transition-all flex items-center gap-4 px-6 py-2 hover:opacity-100`} end> <CgProfile className='text-xl'/> <span>Profile</span></NavLink>
                    </li>
                    <li>
                        <NavLink to={`/${currentUsername}/library`} onClick={(e)=>{openCont(false)}}  className= { ({isActive})=>`${isActive ? 'opacity-100' : 'opacity-80'}  transition-all flex items-center gap-4 px-6 py-2 hover:opacity-100`}> <MdOutlineLibraryAdd className='text-xl'/> <span>Library</span></NavLink>
                    </li>
                    <li>
                        <NavLink to={`/${currentUsername}/stories`} onClick={(e)=>{openCont(false)}}  className={ ({isActive})=> `${isActive ? 'opacity-100' : 'opacity-80'}  transition-all flex items-center gap-4 px-6 py-2 hover:opacity-100`}> <GrDocumentText className='text-xl'/> <span>Stories</span></NavLink>
                    </li>
                </ul>
                <ul className='sidebarCont text-[0.85rem] [&:not(:last-child)]:border-b border-slate-200  py-3'>
                    <li>
                        <NavLink to={`/${currentUsername}/settings`} onClick={(e)=>{openCont(false)}}  className={ ({isActive})=> `${isActive ? 'opacity-100' : 'opacity-80'}  transition-all flex items-center gap-4 px-6 py-2 opacity-80 hover:opacity-100`}> <IoSettingsOutline className='text-xl'/> <span>Settings</span></NavLink>
                    </li>
                </ul>
                <ul className='sidebarCont text-[0.85rem] [&:not(:last-child)]:border-b border-slate-200  py-3'>
                    <li>
                        <div onClick={(e)=>{setSignOutDiagDisp(true); }} className="flex flex-col justify-center gap-1 px-6 py-2 opacity-80 hover:opacity-100 cursor-pointer"> <span>Sign out</span> <span>us*****@gmail.com</span></div>
                    </li>
                    <DialogModal isOpen={signOutDiagDisp} title="Are you sure to logout?" type={"confirm"} onConfirm={()=>{signOut()}} onClose={()=>{setSignOutDiagDisp(false);  openCont(false)}}/>
                </ul>
            </div>

    </>
  )
})

export default UserSidebar