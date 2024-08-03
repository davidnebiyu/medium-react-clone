
import './index.css'
import NavBar from './Components/NavBar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import RootPage from './Components/RootPage'
import HomePage from './Components/HomePage'
import Backdrop from './UI/Backdrop'
import ModalCont from './UI/ModalCont'
import { useSelector } from 'react-redux'

function App() {

  const router = createBrowserRouter([
    {path:'/', element:<RootPage/>, children:[
      {index:true, element:<HomePage/>},
    ]}
  ])

  const modalElement = useSelector((state)=>state.ui.modalElement)
 

  return (
    <>
     <RouterProvider router={router}/>
     <ToastContainer
        position='top-right'
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="z-[100000000]"
     />
     {modalElement && <ModalCont 
          Component={modalElement} 
        />}
    </>
  )
}

export default App
