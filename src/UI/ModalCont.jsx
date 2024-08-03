import React from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { uiAction } from "../Store/Store";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "./Backdrop";

function ModalCont({Component}) {
  const isBackdrop = useSelector((state) => state.ui.backdropStat);
  const dispatch = useDispatch();
  return (
    <>
    
      {createPortal(
        <div className={`${
          !isBackdrop ? "invisible opacity-0" : "visible opacity-100"
        }  transition-all duration-500 fixed top-0 left-0 w-full h-full z-[200]`}>
          <Backdrop/>
          <div
            className={` fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] !z-[300] bg-white shadow-xl p-8 w-full h-full  sm:w-[600px] sm:h-fit` }
          >
            
              <button
                onClick={() => {
                  dispatch(uiAction.removeModalElement());
                }}
                className="absolute right-1 top-1 p-2 text-xl"
              >
                <FaTimes />
              </button>
              <Component/>
            {/* </div> */}
          </div>
        </div>,
        document.getElementById("overlay")
      )}
    </>
  );
}

export default ModalCont;
