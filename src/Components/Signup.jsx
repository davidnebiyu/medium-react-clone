import React, { useState } from 'react'
import Signin from './Signin'
import { FcGoogle } from "react-icons/fc";
import {  MdOutlineEmail } from "react-icons/md";
import { uiAction } from '../Store/Store'
import { useDispatch } from 'react-redux'
import { FaAngleLeft } from 'react-icons/fa';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";


function Signup() {
    const dispatch = useDispatch()
    const [emailsignup, setEmailsignup] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)
  return (
    <>
        
        {!emailsignup ?
            <div className="flex flex-col items-center gap-4">
            <p className='font-title text-2xl mb-16 text-center'>Join Medium.</p>
            <div className="flex flex-col gap-4 items-center">
                <button className='mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]'> <span className='text-xl'><FcGoogle/></span> <span>Sign up with Google</span> <span></span></button>
                <button onClick={()=>{setEmailsignup(true)}} className='mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]'> <span className='text-xl'><MdOutlineEmail/></span> <span>Sign up with Email</span> <span></span></button>
            </div>
            <p className='mt-[2rem]'>Already have an account? <button  onClick={()=>{dispatch(uiAction.setModalElement(Signin))}} className='text-green-700 hover:text-green-900'>Sign In</button></p>
            <p className='text-center text-xs'>Click “Sign In” to agree to Medium’s Terms of Service and acknowledge that Medium’s Privacy Policy applies to you.        </p>
            </div> 
        :
        <div className="flex flex-col items-center gap-4">
            <p className='font-title text-2xl mb-16 text-center'>Sign up with email</p>
            <form action="" className='flex flex-col items-center gap-4'>
                <div className="">
                    <p className='text-center'>Your Username</p>
                    <input type="text" className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                </div>
                <div className="">
                    <p className='text-center'>Your Email</p>
                    <input type="email" className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                </div>
                <div className="">
                    <p className='text-center'>Your Password</p>
                    <div className="pwdField">
                        <input type={passwordVisible ? 'text' : 'password'} className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                        <button onClick={()=>{setPasswordVisible(!passwordVisible)}} type='button' className=''>{passwordVisible ? <IoMdEyeOff/> : <IoMdEye/>}</button>
                    </div>                
                </div>
                <div className="">
                    <p className='text-center'>Repeat Password</p>
                        <input type={passwordVisible ? 'text' : 'password'} className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                </div>
                
                    <button className='mediumBtn  !w-[250px]'> Continue</button>
            </form>
             <button onClick={()=>{setEmailsignup(false)}} className='text-green-700 hover:text-green-900 flex items-center mt-[2rem]'> <FaAngleLeft className='text-xl'/> All sign up options</button>
             <p className='text-center text-xs'>Click “Sign In” to agree to Medium’s Terms of Service and acknowledge that Medium’s Privacy Policy applies to you.        </p>
        </div> 
        }

</>
  )
}

export default Signup