import React, { useEffect, useState } from 'react'
import Posts from './Posts'
import { Link } from 'react-router-dom'
import Loading from '../UI/Loading'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../Firebasem/Store'
import { toast } from 'react-toastify'
import { readData } from '../Firebasem/FirestoreF'
function Explore() {


    const [Blogs, setBlogs] = useState({loading:true, data:[], error:null})

    const getBlogs = async()=>{
        setBlogs((prevData)=>({
            ...prevData, 
            error:null,
            loading:true,
        }))   
        try {          
            const ref = collection(db, "posts")
            const queryRef = query(ref, where("status", "==", "PUBLISHED"), orderBy("timeStamp", "desc"))
            const querySnapShot = await getDocs(queryRef)
    
            if(querySnapShot.empty){
                throw new Error("NO_DATA_FOUND")
            }

            const arr = [];

            querySnapShot.forEach(async (snap)=>{

                return arr.push(
                    {blogId:snap.id, blogData:snap.data()}
                )
                
            })

                setBlogs((prevData)=>({
                    ...prevData, 
                    data:arr
                }))   
                
        } catch (error) {
            console.log(error);   
            setBlogs((prevData)=>({
                ...prevData, 
                error:error
            }))    
            error.message != "NO_DATA_FOUND" && toast.error("There was some error!")   
        }finally{
            setBlogs((prevData)=>({
                ...prevData, 
                loading:false
            }))   
        }

        
    }

    useEffect(()=>{
        getBlogs()
    }, [])

  return (
    <>
        <div className="wrapper px-5 flex relative ">
            
            <div className='flex-3 py-8 w-full sm:w-[70%] sm:border-r sm:pr-3 md:pr-20'>
                {
                   Blogs.loading && <div className='w-full relative top-[5rem] flex justify-center items-center'> <div className='loader'></div> </div> 
                }

                {
                    !Blogs.loading && Blogs.error && Blogs.error == "NO_DATA_FOUND" && <p className='font-bold'>NO BLOGS YET!</p>
                }

                {
                    !Blogs.loading && !Blogs.error && Blogs.data.length > 0 && 

                    Blogs.data.map((blog)=>(
                        <Posts postID={blog.blogId} post={blog.blogData}/>
                    ))
                }

            </div>
            
            
            <div className="flex-1 hidden sm:flex flex-col gap-10 pl-3 md:pl-6 py-10 ">

                <div className="w-full bg-blue-300 flex flex-col gap-4 p-4 rounded-sm max-w-[300px]">
                    <p className='font-bold'>Writing on Medium</p>
                    <div className="flex flex-col text-nowrap  overflow-hidden">
                        <Link to="">New Writer FAQ</Link>
                        <Link to="">Expert Giving Writing advice</Link>
                        <Link to="">Grow your readership</Link>
                    </div>
                    <Link to="/write" className='mediumBtn'>Start Writing</Link>
                </div>

                <div className="">
                    <p className='font-bold mb-4'>Recommended topics </p>
                    <div className="flex gap-4 flex-wrap">
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>Node js</Link>
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>React</Link>
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>Psychology</Link>
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>Health</Link>
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>Politics</Link>
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>Geography</Link>
                        <Link to="" className='mediumBtn !bg-slate-200 !text-inherit text-sm hover:underline'>Sport</Link>
                    </div>
                </div>


                

            </div>
        </div>

    </>
  )
}

export default Explore