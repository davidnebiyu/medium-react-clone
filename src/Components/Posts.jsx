import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CiSaveDown2 } from "react-icons/ci";
import { PiHandsClappingThin } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";
import blogvector from '../assets/blog-vector.png'
import UserDiscModal from './UserDiscModal';
import { AiOutlinePushpin } from "react-icons/ai";

function Posts({post, source}) {
    const {title, desc, date, comments, claps, userID} = post
    const [isUserDiscVisible, setIsUserDiscVisible] = useState(false)
    const [mousePos, setMousePos] = useState(null)
  return (
    <>
            <div className="text-slate-700 py-4 [&:not(:last-child)]:border-b border-slate-200">
                {source == "profile" && post.pinned && <p className=' mb-4 flex items-center gap-1 text-[0.85rem]'><AiOutlinePushpin className='text-xl'/> Pinned</p>}
                <Link to="/explore/6567576" className=" w-full flex items-center gap-2 justify-between ">
                    <div className="flex flex-col gap-3 w-[75%]">
                        <Link to="/@devad" className='relative w-fit text-[0.85rem] text-slate-800' onMouseEnter={(e)=>{setIsUserDiscVisible(true); setMousePos(e)}} onMouseLeave={(e)=>{setIsUserDiscVisible(false)}} >
                            <div className="flex gap-4 items-center hover:underline">
                                <div className="w-[30px] ">
                                    <img src={blogvector} className='w-full border rounded-[50%] object-cover object-center' alt="" /> 
                                </div>
                                <span>Dawit Nebiyu</span>
                            </div>
                            {isUserDiscVisible && <UserDiscModal mousePos={mousePos} userID="1234" onClick={(e)=>{e.preventDefault()}}/>}
                        </Link>
                        <div className="flex flex-col gap-2">
                            <p className='text-xl sm:text-2xl text-slate-900 font-bold'>{title}</p>
                            <p className='text-slate-600'>{desc}</p>
                        </div> 
                        <div className="w-full flex justify-between text-[0.85rem]">
                            <div className="flex gap-6">
                                <p className='flex items-center gap-1'> {date}</p>
                                <p className='flex items-center gap-1'> <PiHandsClappingThin className='text-slate-950'/> {claps}</p>
                                <p className='flex items-center gap-1'><FaRegComment className='text-slate-950'/> {comments}</p>
                            </div>
                            <div className="">
                                <button title='save' onClick={(e)=>{alert("Hey"); e.preventDefault()}}><CiSaveDown2 className='text-2xl hover:text-slate-950'/></button>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[25%] pl-2">
                        <img src={blogvector} className='object-cover object-center' alt="" />
                    </div>
                </Link>
            </div>


    </>
  )
}

export default Posts