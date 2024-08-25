import React from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { uiAction } from "../Store/Store";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "./Backdrop";

function ModalCont({Component}) {
  const modalElement = useSelector((state) => state.ui.modalElement);
  const dispatch = useDispatch()
  
  return (
    <>
    
      {createPortal(
        <div className={`transition-all duration-[3000ms] fixed top-0 left-0 w-full h-full z-[200] ${
          modalElement ? "opacity-100" : "opacity-0"
        }  `}>
          <Backdrop onClick={()=>{dispatch(uiAction.removeModalElement())}}/>
          <div
            className={`fixed !z-[300] bg-red-500` }
          >
              <Component/>
          </div>
        </div>,
        document.getElementById("overlay")
      )}
    </>
  );
}

export default ModalCont;
