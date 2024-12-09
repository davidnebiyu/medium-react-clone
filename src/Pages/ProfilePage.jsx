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
import { checkFollowStat, checkUser } from "../Hooks/AuthValidation";
import profilepic from "../assets/profilepic.png";
import { data } from "autoprefixer";

function ProfilePage() {
  const navigate = useNavigate();
  const param = useParams();
  const username = param.username;

  const currentUser = useSelector((state) => state.auth.currentUser);
 
  const currentUserData = useSelector((state) =>
    state.auth.currentUserData
  );
  
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

  const [prevParamUser, setPrevParamUser] = useState(null);

  const [Blogs, SetBlogs] = useState({ loading: true, data: [], error: null });
  const [About, setAbout] = useState({ data: "", loading: true, error: null });

  const {followers, following, loading:followLoading, error:followError, followerSize, followingSize, setFollowers:settingFollowers, setFollowing:settingFollowing, setFwSize:setFollowingSize, setFrSize:setFollowerSize, checkStat:getStat} = checkFollowStat()

  const checkPosts = async () => {
    
    if ( !userData || (username != userData.username && paramUserId == prevParamUser)) {
      return;
    }

    try {
      const docRef = await readData({
        collectionName: "users",
        Id: paramUserId,
      });
      if (docRef.exists()) {
        const POSTSRef = collection(db, "posts");
        const POSTQuery = query(POSTSRef, where("blogger", "==", paramUserId));
        const POSTSnap = await getDocs(POSTQuery);

        if (!POSTSnap.empty) {
          let postsArr = [];

          POSTSnap.forEach((post) => {
            return postsArr.push({ id: post.id, info: post.data() });   
          });

          SetBlogs((prevData) => ({
            ...prevData,
            data: postsArr,
          }));
        } else {
          throw new Error("NO_DATA_FOUND");
        }
      } else {
        throw new Error("USER_NOT_FOUND");
      }
    } catch (error) {
      console.log(error);
      SetBlogs((prevData) => ({
        ...prevData,
        error: error.message,
      }));

      error.message != "NO_DATA_FOUND" && toast.error("There was some errror!");
    } finally {
      SetBlogs((prevData) => ({
        ...prevData,
        loading: false,
      }));
      setPrevParamUser(paramUserId);
    }
  };

  const checkAbout = async () => {
    if ( !userData || (username != userData.username && paramUserId == prevParamUser)) {
      return;
      // this is for accepting the latest userData from the URL username, i.e let the checkUser async run first whwn routing
    }

    try {
      const docRef = await readData({
        collectionName: "users",
        Id: paramUserId,
      });
      if (docRef.exists()) {
        if (docRef.data().about && docRef.data().about.length > 0) {
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
      setPrevParamUser(paramUserId);
    }
  };

  const checkFollowers = async () => {
    if ( !userData || (username != userData.username && paramUserId == prevParamUser)) {
      return;
    }

    try {
      getStat({user1ID:paramUserId, getFollowers:true })
    } catch (error) {
    } finally {
      setPrevParamUser(paramUserId);
    }
  };

  const checkFollowing = async () => {
    if ( !userData || (username != userData.username && paramUserId == prevParamUser)) {
      return;
    }

    try {
      getStat({user1ID:paramUserId, getFollowings:true })
    } catch (error) {
    } finally {
      setPrevParamUser(paramUserId);
    }
  };

  useEffect(() => {
    if (section == "home") {
      SetBlogs((prevData) => ({
        loading: true,
        data: [],
        error: null,
      }));
      checkPosts()
    } else if (section == "followers") {
      // setFollowers((prevData) => ({
      //   data: [],
      //   loading: true,
      //   size: null,
      //   error: null,
      // }));
      checkFollowers();
    } else if (section == "following") {
      // setFollowing((prevData) => ({
      //   data: [],
      //   loading: true,
      //   size: null,
      //   error: null,
      // }));
      checkFollowing();
    } else if (section == "about") {
      setAbout((prevData) => ({
        data: "",
        loading: true,
        error: null,
      }));
      checkAbout();
    }
  }, [section, param, currentUser, paramUserId, userData]);

  useEffect(()=>{
    if ( !userData || (username != userData.username && paramUserId == prevParamUser)) {
      return;
    }
    getStat({user1ID:paramUserId})
  }, [param, paramUserId])

  const [editAbout, setEditAbout] = useState(false);
  const editAboutDiv = useRef(null);

  useEffect(() => {
    if (editAbout) {
      editAboutDiv.current.focus();
    }
  }, [editAbout]);

  const [submitting, setSubmitting] = useState(false);

  const handleEditAbout = async () => {
    setSubmitting(true);

    try {
      await updateData({
        collectionName: "users",
        Id: currentUser,
        data: {
          about:
            editAboutDiv.current.innerText.trim().length > 0
              ? editAboutDiv.current.innerHTML
              : "",
        },
      });
      setEditAbout(false);
      if (!editAboutDiv.current.innerText.trim().length > 0) {
        setAbout((prevData) => ({
          ...prevData,
          data: "",
          error: "NO_DATA_FOUND",
        }));
      } else {
        setAbout((prevData) => ({
          ...prevData,
          data: editAboutDiv.current.innerHTML,
          error: null,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatText = (text) => {
    return (
      <div
        className="aboutContent"
        dangerouslySetInnerHTML={{ __html: text }}
      />
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
                {userData && userData.name}
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
                  Followers {followerSize && `(${followerSize})`}
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
                  Following {followingSize && `(${followingSize})`}
                </button>
              </div>
              {section == "home" && (
                <>
            
                  {Blogs.loading && (
                    <div className="flex justify-center">
                      {" "}
                      <div className="loader small"></div>{" "}
                    </div>
                  )}
                   {!Blogs.loading &&
                    Blogs.error == "NO_DATA_FOUND" && (
                      <div className="">
                        {" "}
                        No Blog Posts yet.{" "}
                        {isCurrentUser
                          ? <> Explore Your intersets and share the content! <span className="underline"> <Link to="/write">Start Here</Link></span> </>
                          : ""}
                      </div>
                    )}
                  {!Blogs.loading && !Blogs.error && (
                    <>
                      {Blogs.data.map((post, index) => (
                        <>
                          <Posts post={post.info} postID={post.id} source="profile" key={post.id} />
                        </>
                      ))}
                    </>
                  )}
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
                            ></div>

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
                                <button
                                  disabled={submitting}
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
                                <button
                                  disabled={submitting}
                                  className="mediumBtn !px-6"
                                  onClick={handleEditAbout}
                                >
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
                                editAboutDiv.current.innerHTML = About.data;
                              }}
                              className="mediumBtn !text-black1 !bg-transparent !border !border-black1 !px-6"
                            >
                              Cancel
                            </button>
                          )}
                          {editAbout && (
                            <button
                              onClick={handleEditAbout}
                              className="mediumBtn !px-6"
                            >
                              {submitting ? "Updating..." : "Save"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}
              {section == "following" && (
                <>
                  {followLoading && (
                    <div className="flex justify-center">
                      {" "}
                      <div className="loader small"></div>{" "}
                    </div>
                  )}
                  {!followLoading &&
                    followError == "NO_FOLLOWING_FOUND" && (
                      <div className="">
                        {" "}
                        No followings yet.{" "}
                        {isCurrentUser
                          ? "Explore and connect with others!"
                          : ""}
                      </div>
                    )}
                  {!followLoading &&
                    !followError &&
                    following.map((followedUser, index) => (
                      <>
                        <div
                          className="flex gap-4 justify-between py-2 items-center"
                          key={followedUser.id}
                        >
                          <div className="flex gap-6">
                            <Link to={`/@username`} className="w-[40px]">
                              <img
                                src={`${
                                  followedUser.info.userImage
                                    ? followedUser.info.userImage
                                    : profilepic
                                }`}
                                className="rounded-[50%] w-full object-cover object-center"
                                alt=""
                              />
                            </Link>
                            <div className="flex flex-col">
                              <Link
                                to={`/${followedUser.info.username}`}
                                className="hover:underline w-fit font-bold text-slate-900"
                              >
                                {followedUser.info.name}
                              </Link>
                              <p>{followedUser.info.bio}</p>
                            </div>
                          </div>
                          {(currentUser != followedUser.id) && <FollowBtn className="!h-fit" user1={currentUser} onSetFollowing={settingFollowing} onSetFollowingSize={setFollowingSize} user2={followedUser.id}/>}
                        </div>
                      </>
                    ))}
                </>
              )}
              {section == "followers" && (
                <>
                  {followLoading && (
                    <div className="flex justify-center">
                      {" "}
                      <div className="loader small"></div>{" "}
                    </div>
                  )}
                  {!followLoading &&
                    followError == "NO_FOLLOWERS_FOUND" && (
                      <div className="">
                        {" "}
                        No Followers yet!{" "}
                        {isCurrentUser
                          ? "Share and post content to gain followers!"
                          : "Be the first to follow this account!"}
                      </div>
                    )}
                  {!followLoading &&
                    !followError &&
                    followers.map((follower, index) => (
                      <>
                        <div
                          className="flex gap-4 justify-between py-2 items-center"
                          key={index}
                        >
                          <div className="flex gap-6">
                            <Link to={`/@username`} className="w-[40px]">
                              <img
                                src={`${
                                  follower.info.userImage
                                    ? follower.info.userImage
                                    : profilepic
                                }`}
                                className="rounded-[50%] w-full object-cover object-center"
                                alt=""
                              />
                            </Link>
                            <div className="flex flex-col">
                              <Link
                                to={`/${follower.info.username}`}
                                className="hover:underline w-fit font-bold text-slate-900"
                              >
                                {follower.info.name}
                              </Link>
                              <p>{follower.info.bio}</p>
                            </div>
                          </div>
                          {(currentUser != follower.id) && <FollowBtn className="!h-fit" user1={currentUser} onSetFollowers={settingFollowers} onSetFollowingSize={setFollowingSize} user2={follower.id} />}
                        </div>
                      </>
                    ))}
                </>
              )}
            </div>

            <div className=" flex-1 flex flex-col gap-5 sm:gap-10 pl-3 md:pl-6 py-8 sm:py-10 text-slate-700">
              <div className="flex items-center sm:items-start gap-6 sm:flex-col sm:gap-2">
                <div className="w-[70px] h-[70px]">
                  <img
                    src={
                      userData && userData.userImage
                        ? userData.userImage
                        : profilepic
                    }
                    alt=""
                    className="w-full h-full object-cover object-center rounded-[50%]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-slate-900 font-bold text-2xl sm:text-base">
                    {userData && userData.name}
                  </p>
                </div>
                <p className="hidden sm:flex">
                  {userData && userData.bio}
                </p>
              </div>

              {!isCurrentUser && (
                <FollowBtn className="!h-fit !w-full sm:!w-fit" user1={currentUser} onSetFollowers={settingFollowers} onSetFollowing={settingFollowing} onSetFollowingSize={setFollowingSize} user2={paramUserId} />
              )}

            
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ProfilePage;
