import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { NavLink } from 'react-router-dom'
import { FaBars } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { uiAction } from '../Store/Store';
import Signin from './Signin';

function NavBar() {

    const [sidebar, setSideBar] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const dispatch = useDispatch()

    useEffect(()=>{

        const handleResize = () => {
            setWindowWidth(window.innerWidth);

        };
      
          window.addEventListener('resize', handleResize);
      
          return () => {
            window.removeEventListener('resize', handleResize);
          };  

    },[window.innerWidth])

  return (
    <>
    
        <div className="w-full  fixed top-0 left-0 border-b border-b-black1 transition-all z-[100] bg-yellow-500">
            <nav className='wrapper px-4'>
                <ul className='h-[70px] w-full flex items-center justify-between gap-[1rem] relative bg-yellow-500'>
                    <ul>
                        <li>
                            <NavLink to="/"  className={`capitalize`}  ><img src={logo} width={180} alt="" /></NavLink>
                        </li>
                    </ul>
                    <ul className={ `flex gap-[1rem] bg-inherit transition-all visible ${windowWidth < 640 && sidebar == false ? ' invisible opacity-0' : ' visible opacity-100'} ${windowWidth < 640 ? 'fixed top-[70px] w-full left-0 max-h-[calc(100vh-70px)] p-[1rem] flex-col' : 'flex-row'} `} >
                        <li>
                            <NavLink to=""  className={`capitalize`}  >Membership</NavLink>
                        </li>
                        <li>
                            <NavLink to=""  className={`capitalize`}  >Our Story</NavLink>
                        </li>
                        <li>
                            <NavLink to=""  className={`capitalize`}  >Write</NavLink>
                        </li>
                        <li>
                            <button  className={`capitalize`}  onClick={()=>{dispatch(uiAction.setModalElement(Signin)) }}>Sign In</button>
                        </li>
                    </ul>
                    <ul className='sm:hidden'>
                        <li><button onClick={()=>{setSideBar(!sidebar)}} className='border border-black1 p-2'>{sidebar ? <FaTimes/> : <FaBars/>}</button></li>
                    </ul>
                </ul>
            </nav>
        </div>

    </>
  )
}

export default NavBar