import React from 'react'

function Loading({transparent=false, size="normal"}) {
  return (
        <div className={`fixed inset-0 grid place-items-center ${transparent ? "bg-transparent" : "bg-white"} z-30`}>
          <div className={`loader ${size == "small" ? "small" : ''}`}></div>
        </div>
  )
}

export default Loading