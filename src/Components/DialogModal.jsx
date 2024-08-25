import React from "react";
import ReactDom, { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { uiAction } from "../Store/Store";
import Backdrop from "../UI/Backdrop";
import UserSidebar from "../UI/UserSidebar";

function DialogModal({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onClose,
  onCancel,
  children,
  disabled
}) {
  const dispatch = useDispatch();

  const handleClose = () => {
    if(disabled){
      return false
    }
    onClose();
  };

  const handleCancel = () => {
    onCancel && onCancel();
    handleClose();
  };

  const handleConfim = () => {
    onConfirm();
    handleClose();
  };

  if (!isOpen) {
    return null;
  }
  console.log(disabled);
  
  return (
    <>
    {
      !type || type != "confirm" && 
      (
            <> 
            <Backdrop onClick={handleClose} transparent={type == "sidebar" ? true : 'semi'}/>
            {children}
            </>

      )
    }
            {type == "confirm" && (
              <>           
              {createPortal(
                <div className={``}>
                  <Backdrop onClick={handleClose} className="z-[600]" transparent={true} />
                  <div className={`transition-all duration-1000 ${isOpen ? "visible opacity-100" : "invisible opacity-0" } fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white shadow-lg border p-8  z-[600] w-[80%] max-w-[600px]`}>
                    <button
                      onClick={handleClose}
                      className="absolute right-1 top-1 p-2 text-xl"
                    >
                      <FaTimes />
                    </button>
        
                      <div className={`flex flex-col items-center gap-4`}>
                        <p className="font-bold text-xl">{title}</p>
                        <p>{message}</p>
                        <div className=" flex gap-4 ">
                          <button
                            className="bg-red-500 py-2 px-4 text-white rounded-sm"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-blue-500 py-2 px-4 text-white rounded-sm"
                            onClick={handleConfim}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
        
                  </div>
                </div>,
                document.getElementById("overlay")
              )}
              </>
            )}
    </>
  );
}

export default DialogModal;
