
import './index.css'
import NavBar from './Components/NavBar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import HomePage from './Pages/HomePage'
import Backdrop from './UI/Backdrop'
import ModalCont from './UI/ModalCont'
import { useSelector } from 'react-redux'
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from 'react'
import AuthListener from './Hooks/AuthListener'
import WritePage from './Pages/WritePage'
import RootPage from './Pages/RootPage'
import PrivateRoute from './Components/PrivateRoute'
import ProfilePage from './Pages/ProfilePage'
import SettingsPage from './Pages/SettingsPage'
import LibraryPage from './Pages/LibraryPage'
import StoryPage from './Pages/StoryPage'
import PostPage from './Pages/PostPage'

function App() {

  const router = createBrowserRouter([
    {path:'/', element:<RootPage/>, children:[
      {index:true, element:<HomePage/>},
      {element:<PrivateRoute from="out"/>, children:[
        {path:"/write", element:<WritePage/>},
      ]},
      {path:'/:username', children:[
        {index:true, element:<ProfilePage/>},
        {element:<PrivateRoute from="out"/>, children:[
          {path:"settings", element:<SettingsPage/>},
          {path:"library", element:<LibraryPage/>},   
          {path:"stories", element:<StoryPage/>},  
        ]},
        {path:":POST_ID", element:<PostPage/>},          
      ]}
    ]}
  ])

  const modalElement = useSelector((state)=>state.ui.modalElement)
  
    AuthListener()

  return (
    <>
     <RouterProvider router={router}/>
     <ToastContainer
        position='top-right'
        autoClose={2000}
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
