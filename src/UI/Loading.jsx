import React from 'react'

function Loading() {
  return (
        <div className="fixed inset-0 grid place-items-center bg-white z-30">
          <div className="loader"></div>
        </div>
  )
}

export default Loading