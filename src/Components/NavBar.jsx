import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { uiAction } from "../Store/Store";
import Signin from "./Signin";
import { LuClipboardEdit } from "react-icons/lu";
import { IoIosSearch } from "react-icons/io";
import profilepic from "../assets/profilepic.png";
import UserSidebar from "../UI/UserSidebar";
import DialogModal from "./DialogModal";

function NavBar() {
  const [sidebar, setSideBar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUsername = useSelector((state) => state.auth.currentUserData ? state.auth.currentUserData.username : null);
  const currentUserImg = useSelector((state) => state.auth.currentUserData ? state.auth.currentUserData.userImage : null);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  const UserSidebarRef = useRef(null);
  const navbarRef = useRef(null);

  const sidebarActionBtn = useRef(null);
  const [ isSidebarVisible, setIsSidebarVisible ] = useState();

  return (
    <>
      <div
        ref={navbarRef}
        className={`w-full  fixed top-0 left-0 border-b border-b-black1 transition-all z-[100] ${
          currentUser ? "bg-white" : "bg-yellow-500"
        }`}
      >
        <nav className="wrapper px-4">
          <ul
            className={`h-[70px] w-full flex items-center justify-between gap-[1rem] relative ${
              currentUser ? "bg-white" : "bg-yellow-500"
            }`}
          >
            <ul className="flex items-center">
              <li>
                <NavLink to="/" className={`capitalize`}>
                  <img src={logo} width={180} alt="" />
                </NavLink>
              </li>
              {currentUser && (
                <>
                  <li className="hidden sm:block">
                    <div className="flex gap-2 items-center !py-[0.25rem] !px-[0.5rem] !text-black1 border mediumBtn sm:!bg-slate-100 !bg-transparent cursor-pointer">
                      {" "}
                      <IoIosSearch className="text-xl" />{" "}
                      <form action="">
                        <input
                          type="text"
                          className="bg-inherit outline-none w-[300px] text-[0.8rem]"
                          placeholder="Search Medium"
                        />{" "}
                      </form>
                    </div>
                  </li>
                </>
              )}
            </ul>
            <ul
              className={`flex items-center gap-[1rem] bg-inherit transition-all visible ${
                windowWidth < 640 && sidebar == false && !currentUser
                  ? " invisible opacity-0"
                  : " visible opacity-100"
              } ${
                windowWidth < 640 && !currentUser
                  ? "fixed top-[70px] w-full left-0 max-h-[calc(100vh-70px)] p-[1rem] flex-col"
                  : "flex-row"
              } `}
            >
              {!currentUser && (
                <>
                  <li>
                    <NavLink
                      onClick={() => {
                        setSideBar(false);
                      }}
                      to=""
                      className={`capitalize`}
                    >
                      Membership
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      onClick={() => {
                        setSideBar(false);
                      }}
                      to=""
                      className={`capitalize`}
                    >
                      Our Story
                    </NavLink>
                  </li>
                </>
              )}
              {currentUser && (
                <>
                  <li className="sm:hidden">
                    <NavLink to="/search"> <IoIosSearch className="text-xl" /> </NavLink>
                  </li>
                  <li>
                    <NavLink
                      onClick={() => {
                        setSideBar(false);
                      }}
                      to="/write"
                      title="write"
                      className={`capitalize flex flex-nowrap items-center gap-1`}
                    >
                      {" "}
                      <LuClipboardEdit className="text-xl" />{" "}
                      <span className="hidden sm:flex">write</span>
                    </NavLink>
                  </li>

                  <li className="relative" >
                    <button className="sidebarToggleBtn"  onClick={()=>{setIsSidebarVisible(!isSidebarVisible)}}>
                      
                      <div className="w-[32px] h-[32px]">
                        <img 
                          src={currentUserImg ? currentUserImg : profilepic}
                          className="w-full h-full rounded-[50%] object-cover object-center"
                          alt=""
                        />
                      </div>
                    </button>

                    <DialogModal isOpen={isSidebarVisible} type="sidebar" onClose={()=>{setIsSidebarVisible(false)}}  ><UserSidebar openCont={setIsSidebarVisible}/></DialogModal>

                  </li>
                </>
              )}
              {!currentUser && (
                <li>
                  <button
                    className={`capitalize`}
                    onClick={() => {
                      dispatch(uiAction.setModalElement(Signin));
                    }}
                  >
                    Sign In
                  </button>
                </li>
              )}
            </ul>
            {!currentUser && (
              <ul className="sm:hidden">
                <li>
                  <button
                    onClick={() => {
                      setSideBar(!sidebar);
                    }}
                    className="border border-black1 p-2"
                  >
                    {sidebar ? <FaTimes /> : <FaBars />}
                  </button>
                </li>
              </ul>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}

export default NavBar;
