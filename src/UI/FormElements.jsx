import React, { forwardRef, useRef } from 'react'

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

