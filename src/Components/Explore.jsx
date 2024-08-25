import React from 'react'
import Posts from './Posts'
import { Link } from 'react-router-dom'
import { posts } from './DataForUI'

function Explore() {

  return (
    <>
        <div className="wrapper px-5 flex relative ">
            
            <div className='flex-3 py-8 w-full sm:w-[70%] sm:border-r sm:pr-3 md:pr-20'>
                {
                    posts.map((post,index)=>(
                        <>
                            <Posts post={post} key={post.title}/>
                        </>
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