import React from 'react'

function FormValidate() {
 
    const isEmpty = (value)=>{
        return value.trim() == ''
     }

     const isValidEmail = (email)=>{
        if(isEmpty(email)){
            return false
        }

        return Boolean(
            String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
          ) 
     }

     const isMinLength = (value, length)=>{
        if(isEmpty(value)){
            return false
        }
        return value.length >= length
     }

     const isMaxLength = (value, length)=>{
        if(isEmpty(value)){
            return false
        }
        return value.length <= length
     }

     const isBnLength = (value, minLength, maxLength)=>{
        if(isEmpty(value)){
            return false
        }
        return value.length >= minLength && value.length <= maxLength
     }

     const validNumBn = (inputValue, minVal, maxVal, positive=null ) =>{
        if(positive){
          return inputValue >= minVal && inputValue <= maxVal && inputValue > 0;
        }else{
          return inputValue >= minVal && inputValue <= maxVal;
        }
  
    }

    const hasSameValue = (value1, value2)=>{
        if(isEmpty(value1) || isEmpty(value2)){
            return false
        }
        
        return value1 == value2
    }

    return {isEmpty, isMinLength, isValidEmail, isMaxLength, isBnLength, validNumBn, hasSameValue}
}

export default FormValidate