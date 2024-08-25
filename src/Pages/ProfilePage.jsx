import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Loading from "../UI/Loading";
import { auth, db } from "../Firebasem/Store";
import { collection, getDocs, query, where } from "firebase/firestore";
import { posts } from "../Components/DataForUI";
import Posts from "../Components/Posts";
import blogvector from "../assets/blog-vector.png";
import UserDiscModal from "../Components/UserDiscModal";
import { useSelector } from "react-redux";
import FollowBtn from "../Components/FollowBtn";
import { readData, updateData } from "../Firebasem/FirestoreF";
import { toast } from "react-toastify";
import { checkUser } from "../Hooks/AuthValidation";
import profilepic from "../assets/profilepic.png";

function ProfilePage() {
  const navigate = useNavigate();
  const param = useParams();
  const username = param.username;

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUsername = useSelector((state) =>
    state.auth.currentUserData ? state.auth.currentUserData.username : null
  );

  const [section, setSection] = useState("home");

  const [mousePos, setMousePos] = useState(0);

  const {
    userloading,
    error,
    isCurrentUser,
    paramUserId,
    isLoggedIn,
    userData,
  } = checkUser({ username: username, dependency: [param, currentUser] });

  const [About, setAbout] = useState({ data: "", loading: true, error: null });
  const [Followers, setFollowers] = useState({
    data: [],
    loading: true,
    error: null,
  });
  const [Following, setFollowing] = useState({
    data: [],
    loading: true,
    error: null,
  });

  const checkAbout = async () => {
    setAbout((prevData) => ({
      ...prevData,
      loading: true,
    }));

    try {
      const docRef = await readData({
        collectionName: "users",
        Id: paramUserId,
      });
      if (docRef.exists()) {
        if (docRef.data().about && docRef.data().about.length > 0) {
          console.log( formatText(docRef.data().about));
          
          setAbout((prevData) => ({
            ...prevData,
            data: docRef.data().about,
          }));
        } else {
          throw new Error("NO_DATA_FOUND");
        }
      } else {
        throw new Error("USER_NOT_FOUND");
      }
    } catch (error) {
      console.log(error);
      setAbout((prevData) => ({
        ...prevData,
        error: error.message,
      }));

      error.message != "NO_DATA_FOUND" && toast.error("There was some errror!");
    } finally {
      setAbout((prevData) => ({
        ...prevData,
        loading: false,
      }));
    }
  };

  const checkFollowers = async () => {
    setFollowers((prevData) => ({
      ...prevData,
      loading: true,
    }));

    try {
      const docRef = await readData({
        collectionName: "users",
        Id: paramUserId,
      });
      if (docRef.exists()) {
        if (docRef.data().followers && docRef.data().followers.length > 0) {
          setFollowers((prevData) => ({
            ...prevData,
            data: docRef.data().followers,
          }));
        } else {
          throw new Error("NO_FOLLOWERS_FOUND");
        }
      } else {
        throw new Error("USER_NOT_FOUND");
      }
    } catch (error) {
      console.log(error);
      setFollowers((prevData) => ({
        ...prevData,
        error: error.message,
      }));

      error.message != "NO_FOLLOWERS_FOUND" &&
        toast.error("There was some errror!");
    } finally {
      setFollowers((prevData) => ({
        ...prevData,
        loading: false,
      }));
    }
  };

  const checkFollowing = async () => {
    setFollowing((prevData) => ({
      ...prevData,
      loading: true,
    }));

    try {
      const docRef = await readData({
        collectionName: "users",
        Id: paramUserId,
      });
      if (docRef.exists()) {
        if (docRef.data().following && docRef.data().following.length > 0) {
          setFollowing((prevData) => ({
            ...prevData,
            data: docRef.data().following,
          }));
        } else {
          throw new Error("NO_FOLLOWING_FOUND");
        }
      } else {
        throw new Error("USER_NOT_FOUND");
      }
    } catch (error) {
      console.log(error);
      setFollowing((prevData) => ({
        ...prevData,
        error: error.message,
      }));

      error.message != "NO_FOLLOWING_FOUND" &&
        toast.error("There was some errror!");
    } finally {
      setFollowing((prevData) => ({
        ...prevData,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    if (section == "followers") {
      checkFollowers();
    } else if (section == "following") {
      checkFollowing();
    } else if (section == "about") {
      checkAbout();
    }
  }, [section, param, currentUser]);

  const [editAbout, setEditAbout] = useState(false);
  const editAboutDiv = useRef(null)

  useEffect(()=>{
    if(editAbout){
      editAboutDiv.current.focus();
    }
  }, [editAbout])

  const [submitting, setSubmitting] = useState(false)

  const handleEditAbout = async()=>{
    
    setSubmitting(true)
    
    try {
      await updateData({
        collectionName: "users",
        Id: currentUser,
        data: { about: editAboutDiv.current.innerText.trim().length > 0 ? editAboutDiv.current.innerHTML : "" },
      });
      setEditAbout(false)
      if(!editAboutDiv.current.innerText.trim().length > 0){
        setAbout((prevData) => ({
          ...prevData,
          data: "",
          error:"NO_DATA_FOUND"
        }));
      }else{
        setAbout((prevData) => ({
          ...prevData,
          data: editAboutDiv.current.innerHTML,
          error:null
        }));
      }
    } catch (error) {
      console.log(error);
      
    }finally{
      setSubmitting(false)
    }
  }

  const formatText = (text) => {
    return (
      <div className="aboutContent" dangerouslySetInnerHTML={{ __html: text }} />
    );
  };

  return (
    <>
      {userloading ? (
        <Loading />
      ) : (
        <>
          <div className="wrapper px-5 flex flex-col-reverse sm:flex-row relative text-slate-700">
            <div className="flex-3 py-4 sm:py-8 w-full sm:w-[70%] sm:border-r sm:pr-3 md:pr-20">
              <p className="hidden sm:block font-bold text-4xl mt-6 mb-10">
                David
              </p>
              <div className="flex gap-6 border-b pb-4 mb-8 items-center relative overflow-x-auto no-scrollbar">
                <button
                  className={`relative ${
                    section == "home"
                      ? "text-slate-900 after:absolute after:-bottom-4 after:border-b after:w-full after:left-0 after:h-1 after:border-b-slate-900 after:cursor-default"
                      : ""
                  } text-[0.85rem] transition-all hover:text-slate-900 `}
                  onClick={() => {
                    setSection("home");
                  }}
                >
                  Home
                </button>
                <button
                  className={` relative ${
                    section == "about"
                      ? "text-slate-900 after:absolute after:-bottom-4 after:border-b after:w-full after:left-0 after:h-1 after:border-b-slate-900 after:cursor-default"
                      : ""
                  } text-[0.85rem] transition-all hover:text-slate-900 `}
                  onClick={() => {
                    setSection("about");
                  }}
                >
                  About
                </button>
                <button
                  className={`relative ${
                    section == "followers"
                      ? "text-slate-900 after:absolute after:-bottom-4 after:border-b after:w-full after:left-0 after:h-1 after:border-b-slate-900 after:cursor-default"
                      : ""
                  } text-[0.85rem] transition-all hover:text-slate-900 `}
                  onClick={() => {
                    setSection("followers");
                  }}
                >
                  Followers
                </button>
                <button
                  className={`relative ${
                    section == "following"
                      ? "text-slate-900 after:absolute after:-bottom-4 after:border-b after:w-full after:left-0 after:h-1 after:border-b-slate-900 after:cursor-default"
                      : ""
                  } text-[0.85rem] transition-all hover:text-slate-900 `}
                  onClick={() => {
                    setSection("following");
                  }}
                >
                  Following
                </button>
              </div>
              {section == "home" && (
                <>
                  {posts.map((post, index) => (
                    <>
                      <Posts post={post} source="profile" keyy={index} />
                    </>
                  ))}
                </>
              )}
              {section == "about" && (
                <>
                  {About.loading && (
                    <div className="flex justify-center">
                      {" "}
                      <div className="loader small"></div>{" "}
                    </div>
                  )}
                  {!About.loading &&
                    About.error == "NO_DATA_FOUND" &&
                    (currentUser ? username == currentUsername : null) && (
                      <>
                        {!editAbout && (
                          <div className="flex flex-col gap-6 justify-center items-center py-8 bg-slate-100 px-8">
                            <p className="font-bold">
                              Tell the world about yourself
                            </p>
                            <p className="text-[0.85rem] text-center">
                              Here’s where you can share more about yourself:
                              your history, work experience, accomplishments,
                              interests, dreams, and more. You can even add
                              images and use rich text to personalize your bio.
                            </p>
                            <button
                              onClick={() => {
                                setEditAbout(true);
                              }}
                              className="mediumBtn !text-[0.85rem] !bg-transparent !text-inherit !border !border-slate-900"
                            >
                              Get Started
                            </button>
                          </div>
                        )}

                        {editAbout && (
                          <div className="text-[1rem] flex flex-col gap-6">
                            <div
                              ref={editAboutDiv}
                              className={`${
                                editAbout ? "border-b" : ""
                              } leading-8 px-4 py-2 outline-none min-h-[100px] rounded-md`}
                              contentEditable={editAbout}
                              role="textbox"
                              aria-multiline="true"
                            >
                              
                            </div>

                            <div
                              className={`${
                                (
                                  currentUser
                                    ? username == currentUsername
                                    : null
                                )
                                  ? "block"
                                  : "hidden"
                              } flex justify-end gap-4 text-[0.85rem]`}
                            >
                              {editAbout && (
                                <button disabled={submitting} 
                                  onClick={() => {
                                    setEditAbout(false);
                                    setAbout((prevData) => ({
                                      ...prevData,
                                      data: prevData.data,
                                    }));
                                  }}
                                  className="mediumBtn !text-black1 !bg-transparent !border !border-black1 !px-6"
                                >
                                  Cancel
                                </button>
                              )}
                              {editAbout && (
                                <button  disabled={submitting} className="mediumBtn !px-6" onClick={handleEditAbout}>
                                  {submitting ? "Updating..." : "Save"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  {!About.loading &&
                    About.error == "NO_DATA_FOUND" &&
                    (!currentUser ||
                      (currentUser ? username != currentUsername : null)) && (
                      <p className="font-bold">No bio </p>
                    )}
                  {!About.loading &&
                    !About.error &&
                    (!currentUser ||
                      (currentUser ? username != currentUsername : null)) && (
                      <div className="text-[1rem] flex flex-col gap-6">
                        <div
                          className=" leading-8 px-4 py-2 outline-none min-h-[100px] rounded-md"
                          role="textbox"
                          aria-multiline="true"
                        >
                          {formatText(About.data)}
                        </div>
                      </div>
                    )}
                  {!About.loading &&
                    !About.error &&
                    (currentUser ? username == currentUsername : null) && (
                      <div className="text-[1rem] flex flex-col gap-6">
                        <div
                          ref={editAboutDiv}
                          className={`${
                            editAbout ? "border-b" : ""
                          } leading-8 px-4 py-2 outline-none min-h-[100px] rounded-md`}
                          contentEditable={editAbout}
                          role="textbox"
                          aria-multiline="true"
                        >
                          {formatText(About.data)}
                        </div>

                        <div
                          className={`${
                            (currentUser ? username == currentUsername : null)
                              ? "block"
                              : "hidden"
                          } flex justify-end gap-4 text-[0.85rem]`}
                        >
                          {!editAbout && (
                            <button
                              disabled={submitting}
                              onClick={() => {
                                setEditAbout(true);
                              }}
                              className="mediumBtn !px-6"
                            >
                              Edit About Info
                            </button>
                          )}
                          {editAbout && (
                            <button
                              disabled={submitting}
                              onClick={() => {
                                setEditAbout(false);
                                editAboutDiv.current.innerHTML = About.data
                              }}
                              className="mediumBtn !text-black1 !bg-transparent !border !border-black1 !px-6"
                            >
                              Cancel
                            </button>
                          )}
                          {editAbout && (
                            <button onClick={handleEditAbout} className="mediumBtn !px-6">{submitting ? "Updating..." : "Save"}</button>
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}
              {section == "following" && (
                <>
                  {Following.loading && (
                    <div className="flex justify-center">
                      {" "}
                      <div className="loader small"></div>{" "}
                    </div>
                  )}
                  {!Following.loading &&
                    Following.error == "NO_FOLLOWING_FOUND" && (
                      <div className="">
                        {" "}
                        No followings yet.{" "}
                        {isCurrentUser
                          ? "Explore and connect with others!"
                          : ""}
                      </div>
                    )}
                  {!Following.loading &&
                    !Following.error &&
                    posts.map((post, index) => (
                      <>
                        <div
                          className="flex gap-4 justify-between py-2"
                          key={index}
                        >
                          <div className="flex gap-6">
                            <Link to={`/@username`} className="w-[60px]">
                              <img
                                src={blogvector}
                                className="rounded-[50%] object-cover object-center"
                                alt=""
                              />
                            </Link>
                            <div className="flex flex-col">
                              <Link
                                to={`/@username`}
                                className="hover:underline w-fit font-bold text-slate-900"
                              >
                                Dawit Nebiyu
                              </Link>
                              <p>Sharing my insight of life</p>
                            </div>
                          </div>
                          <FollowBtn className="!h-fit" userID="1" />
                        </div>
                      </>
                    ))}
                </>
              )}
              {section == "followers" && (
                <>
                  {Followers.loading && (
                    <div className="flex justify-center">
                      {" "}
                      <div className="loader small"></div>{" "}
                    </div>
                  )}
                  {!Followers.loading &&
                    Followers.error == "NO_FOLLOWERS_FOUND" && (
                      <div className="">
                        {" "}
                        No Followers yet!{" "}
                        {isCurrentUser
                          ? "Share and post content to gain followers!"
                          : "Be the first to follow this account!"}
                      </div>
                    )}
                  {!Followers.loading &&
                    !Followers.error &&
                    posts.map((post, index) => (
                      <>
                        <div
                          className="flex gap-4 justify-between py-2"
                          key={index}
                        >
                          <div className="flex gap-6">
                            <Link to={`/@username`} className="w-[60px]">
                              <img
                                src={blogvector}
                                className="rounded-[50%] object-cover object-center"
                                alt=""
                              />
                            </Link>
                            <div className="flex flex-col">
                              <Link
                                to={`/@username`}
                                className="hover:underline w-fit font-bold text-slate-900"
                              >
                                Dawit Nebiyu
                              </Link>
                              <p>Sharing my insight of life</p>
                            </div>
                          </div>
                          <FollowBtn className="!h-fit" userID="1" />
                        </div>
                      </>
                    ))}
                </>
              )}
            </div>

            <div className=" flex-1 flex flex-col gap-5 sm:gap-10 pl-3 md:pl-6 py-8 sm:py-10 text-slate-700">
              <div className="flex items-center sm:items-start gap-6 sm:flex-col sm:gap-2">
                <div className="w-[70px]">
                  <img
                    src={
                      userData && userData.userImage
                        ? userData.userImage
                        : profilepic
                    }
                    alt=""
                    className="w-full object-cover object-center rounded-[50%]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-slate-900 font-bold text-2xl sm:text-base">
                    David
                  </p>
                  <p className="flex gap-4">
                    <p
                      onClick={() => {
                        setSection("followers");
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      700 Followers
                    </p>
                    <p
                      onClick={() => {
                        setSection("following");
                      }}
                      className=" sm:hidden hover:underline cursor-pointer"
                    >
                      20 Following
                    </p>
                  </p>
                </div>
                <p className="hidden sm:flex">
                  Sharing my explorations and insights from life.{" "}
                </p>
              </div>

              {!isCurrentUser && (
                <FollowBtn className="!h-fit !w-full sm:!w-fit" userID="1" />
              )}

              {(section == "home" || section == "about") && (
                <div className="hidden sm:block">
                  <p className="text-slate-900 font-bold">Following</p>

                  <ul className="flex flex-col gap-2 my-4">
                    {posts.map((post, index) => (
                      <>
                        <li className="relative group w-fit" key={index}>
                          <Link
                            to={`/@username`}
                            className="w-fit flex gap-4 items-center hover:underline"
                            onMouseEnter={(e) => {
                              setMousePos(e);
                            }}
                          >
                            <div className="w-[30px]">
                              <img
                                src={blogvector}
                                className=" w-full rounded-[50%] object-cover object-center"
                                alt=""
                              />{" "}
                            </div>
                            <span>Dawit Nebiyu</span>
                          </Link>
                          <div className="hidden group-hover:block">
                            <UserDiscModal source="right" mousePos={mousePos} />
                          </div>
                        </li>
                      </>
                    ))}
                  </ul>
                  <p
                    onClick={() => {
                      setSection("following");
                    }}
                    className=" cursor-pointer hover:underline"
                  >
                    See all (25)
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ProfilePage;
