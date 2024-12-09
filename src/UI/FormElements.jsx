import React, { forwardRef, useEffect, useRef, useState } from 'react'

export const FileInput = forwardRef(({className,children, multiple=false, onSetFile}, ref)=> {
    
    const inputRef = useRef(null)

    const fileHandler = (e)=>{
      if(e.target.files.length > 0){
        onSetFile(e.target.files)
      }
    }

    return (
      <div htmlFor="" className={`${className} cursor-pointer relative`}>
          <div className="cursor-pointer" onClick={()=>{inputRef.current.click()}}>
            {children}
          </div>
          <input 
              ref={inputRef} 
              
              type='file'
              className={`absolute top-0 left-0 w-full h-full hidden  cursor-pointer`}   
              onChange={fileHandler}    
              multiple={multiple}     
          />
        </div>
      
    )
  })


  export const TextArea = forwardRef(({className, placeholder, onfocus, changeHandler, content}, ref)=> {
    

    const messageHandler = (e)=>{
      changeHandler(e.target.value)
      e.target.style.height = "auto"
      e.target.style.height = `${e.target.scrollHeight}px`

    }

    return (
          <textarea name="" ref={ref} id=""  value={content} onChange={messageHandler} placeholder={placeholder} onFocus={onfocus} style={{
            height: 'auto',       // Initial height
            // border: 'none',       // Remove default border
            resize: 'none',       // Disable manual resizing
            // overflow: 'auto',   // Hide overflow
            width: '100%',        // Set width as needed
            padding: '8px',       // Add padding for better aesthetics
            outline: "none"
          }}
           className={`${className}`}></textarea>      
    )
  })

