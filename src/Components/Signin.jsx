import React, { useReducer, useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import {  MdOutlineEmail } from "react-icons/md";
import Signup from './Signup';
import { useDispatch } from 'react-redux';
import { uiAction } from '../Store/Store';
import { FaAngleLeft } from 'react-icons/fa';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import {signinEmail, signinGoogle} from '../Firebasem/AuthF'
import { redirect, useNavigate } from 'react-router-dom';
import FormValidate from '../Hooks/FormValidate';
import { toast } from 'react-toastify';
import { doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { setData } from '../Firebasem/FirestoreF';
import { db } from '../Firebasem/Store';


function Signin() {
    const dispatch = useDispatch()
    // const navigate = useNavigate()
    const [emailsignin, setEmailsignin] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)

    const googleSignin = async()=>{
        try {
            const signinUser = await signinGoogle()

            const ref = doc(db, "users", signinUser.user.uid)
            const userDoc = await getDoc(ref)

            if(!userDoc.exists()){
                await setData({collectionName:'users', Id:signinUser.user.uid, data:{username:signinUser.user.displayName, email:signinUser.user.email, userImage:signinUser.user.photoURL}})                
            }

            redirect("/")
            dispatch(uiAction.removeModalElement())
        } catch (error) {
            console.log(error);
            
        }
    }

    const [submitting, setSubmitting] = useState(false)

    const initialValues = {
        values:{
            email:'', pass:''
        },
        validity:{
            email:false, pass:false
        },
        hasSubmit:false
    }

    const formReduer = (prevValues, action)=>{
        if(action.type == 'input'){
            const {name, value} = action

            return{
                ...prevValues, values:{...prevValues.values, [name]:value}
            }
        }

        if(action.type == 'validity'){
            const {name, value} = action

            return{
                ...prevValues, validity:{...prevValues.validity, [name]:value}
            }
        }

        if(action.type == 'submit'){
            return{...prevValues, hasSubmit:true}
        }

        if(action.type == 'reset'){
            return{...initialValues}
        }

    }

    const [formValues, dispatchForm] = useReducer(formReduer,initialValues)

    const validateInput = (e)=>{
        const {name, value} = e.target

        dispatchForm({type:'input', name, value})
        validateValidity(e)
    }

    const {isEmpty, isValidEmail, isMinLength, hasSameValue} = FormValidate()
    
    const validateValidity = (e=null)=>{
        let validity;
        if(e){
            const {name, value} = e.target

            if(name == 'email'){
              validity = isValidEmail(value)
            }
        
            if(name == 'pass'){
              validity = !isEmpty(value)
            }
            
            dispatchForm({type:'validity', name:name, value:validity})
          }else{
            dispatchForm({type:'validity', name:'email', value: isValidEmail(formValues.values.email)})
            dispatchForm({type:'validity', name:'pass', value:!isEmpty(formValues.values.pass)})
          }
    } 

    const handleSubmit = (e)=>{
        e.preventDefault()
        dispatchForm({type:'submit'})
        validateValidity()
        
        if(formValues.validity.email && formValues.validity.pass){
            submitForm()
        }
    }

    const submitForm = async()=>{
        setSubmitting(true)
        const submitID = toast.loading("Submitting...")
        try {
       
            // check username existence
            // const usernameQuery = query(collection(db, "users" ), where('username', "==", `${formValues.values.username}`))
            // const usernameQuerySnap = await getDocs(usernameQuery)    
            // if(!usernameQuerySnap.empty){
            //     throw new Error("USERNAME EXIST")
            // }
            
            const signinUser = await signinEmail({email:formValues.values.email, password:formValues.values.pass})
            dispatch(uiAction.removeModalElement())
            redirect("/")
            toast.update(submitID, { render: "Successfully signed in! ", type: "success", isLoading: false, autoClose: true });

        } catch (error) {
            if(error.message.indexOf('auth/invalid-credential') > -1){
                toast.update(submitID, { render: "Bad Credentials!", type: "error", isLoading: false, autoClose: true });
            }
            else{
                toast.update(submitID, { render: "There was some Error! ", type: "error", isLoading: false, autoClose: true });
            }
            console.log(error);
            
        }finally{
            setSubmitting(false)
        }

    }

  return (
    <>
    
        {!emailsignin ?
            <div className="flex flex-col items-center gap-4">
            <p className='font-title text-2xl mb-16 text-center'>Welcome Back</p>
            <div className="flex flex-col gap-4 items-center">
                <button onClick={()=>{googleSignin()}} className='mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]'> <span className='text-xl'><FcGoogle/></span> <span>Sign in with Google</span> <span></span></button>
                <button onClick={()=>{setEmailsignin(true)}} className='mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]'> <span className='text-xl'><MdOutlineEmail/></span> <span>Sign in with Email</span> <span></span></button>
            </div>
            <p className='mt-[2rem]'>No account? <button onClick={()=>{dispatch(uiAction.setModalElement(Signup))}} className='text-green-700 hover:text-green-900'>Create one</button></p>
            <p className='text-center text-xs'>Click “Sign In” to agree to Medium’s Terms of Service and acknowledge that Medium’s Privacy Policy applies to you.        </p>
        </div> 
        :
        <div className="flex flex-col items-center gap-4">
            <p className='font-title text-2xl mb-16 text-center'>Sign in with email</p>
            <form action="" className='flex flex-col items-center gap-4' onSubmit={handleSubmit}>
                <div className="">
                    <p className='text-center'>Your Email</p>
                    <input type="email" value={formValues.values.email} onChange={(e)=>{validateInput(e)}} name='email' className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                    { formValues.hasSubmit && formValues.validity.email == false && <p className='text-red-500'>Email is not Valid!</p>}
                </div>
                <div className="">
                    <p className='text-center'>Your Password</p>
                    <div className="pwdField">
                        <input type={passwordVisible ? 'text' : 'password'} value={formValues.values.pass} onChange={(e)=>{validateInput(e)}} name='pass' className='mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center'/>
                        <button onClick={()=>{setPasswordVisible(!passwordVisible)}} type='button' className=''>{passwordVisible ? <IoMdEyeOff/> : <IoMdEye/>}</button>
                    </div>                  
                    { formValues.hasSubmit && formValues.validity.pass == false && <p className='text-red-500'>Password Can not be Empty!</p>}
                </div>
                    <button className='mediumBtn  !w-[250px]' disabled={submitting}> Continue</button>
            </form>
             <button onClick={()=>{setEmailsignin(false)}} className='text-green-700 hover:text-green-900 flex items-center mt-[2rem]'> <FaAngleLeft className='text-xl'/> All sign in options</button>
             <p className='text-center text-xs'>Click “Sign In” to agree to Medium’s Terms of Service and acknowledge that Medium’s Privacy Policy applies to you.        </p>
        </div> 
        }
    
    </>
  )
}

export default Signin