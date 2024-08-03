import React, { useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import {  MdOutlineEmail } from "react-icons/md";
import Signup from './Signup';
import { useDispatch } from 'react-redux';
import { uiAction } from '../Store/Store';
import { FaAngleLeft } from 'react-icons/fa';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";


function Signin() {
    const dispatch = useDispatch()
    const [emailsignin, setEmailsignin] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <>
    
        {!emailsignin ?
            <div className="flex flex-col items-center gap-4">
            <p className='font-title text-2xl mb-16 text-center'>Welcome Back</p>
            <div className="flex flex-col gap-4 items-center">
                <button className='mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]'> <span className='text-xl'><FcGoogle/></span> <span>Sign in with Google</span> <span></span></button>
                <button onClick={()=>{setEmailsignin(true)}} className='mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]'> <span className='text-xl'><MdOutlineEmail/></span> <span>Sign in with Email</span> <span></span></button>
            </div>
            <p className='mt-[2rem]'>No account? <button onClick={()=>{dispatch(uiAction.setModalElement(Signup))}} className='text-green-700 hover:text-green-900'>Create one</button></p>
            <p className='text-center text-xs'>Click “Sign In” to agree to Medium’s Terms of Service and acknowledge that Medium’s Privacy Policy applies to you.        </p>
        </div> 
        :
        <div className="flex flex-col items-center gap-4">
            <p className='font-title text-2xl mb-16 text-center'>Sign in with email</p>
            <form action="" className='flex flex-col items-center gap-4'>
                <div className="">
                    <p className='text-center'>Your Email</p>
                    <input type="email" className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                </div>
                <div className="">
                    <p className='text-center'>Your Password</p>
                    <div className="pwdField">
                        <input type={passwordVisible ? 'text' : 'password'} className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                        <button onClick={()=>{setPasswordVisible(!passwordVisible)}} type='button' className=''>{passwordVisible ? <IoMdEyeOff/> : <IoMdEye/>}</button>
                    </div>                  </div>
                    <button className='mediumBtn  !w-[250px]'> Continue</button>
            </form>
             <button onClick={()=>{setEmailsignin(false)}} className='text-green-700 hover:text-green-900 flex items-center mt-[2rem]'> <FaAngleLeft className='text-xl'/> All sign in options</button>
             <p className='text-center text-xs'>Click “Sign In” to agree to Medium’s Terms of Service and acknowledge that Medium’s Privacy Policy applies to you.        </p>
        </div> 
        }
    
    </>
  )
}

export default Signin