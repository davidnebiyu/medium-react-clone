import React from 'react'
import blogvector from '../assets/blog-vector.png'

function HomePage() {
  return (
    <>
      <header className='bg-slate-200 overflow-hidden'>
        <div className="wrapper px-8 flex flex-col gap-10 h-[calc(100vh-70px)] justify-center relative">
          <p className='font-title text-8xl'>Human <br />
          stories & ideas</p>
          <p className='text-2xl'>A place to read, write, and deepen your understanding </p>
          <button className='mediumBtn !px-8 text-xl transition-all hover:bg-green-600'>Start reading</button>
          <div className="absolute right-0 w-[640px] left-[700px]">
            <img src={blogvector} alt="" title='Image By freepik'/>
          </div>
        </div>
      </header>

    </>
  )
}

export default HomePage