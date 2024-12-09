import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CiSaveDown2 } from "react-icons/ci";
import { PiHandsClappingThin } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";
import UserDiscModal from "./UserDiscModal";
import { AiOutlinePushpin } from "react-icons/ai";
import { readData } from "../Firebasem/FirestoreF";
import profilepic from "../assets/profilepic.png";
import { useSelector } from "react-redux";
import { likePost, savePost } from "../Hooks/PostActions";
import { BsSaveFill } from "react-icons/bs";
import { PiHandsClappingBold } from "react-icons/pi";
import { toast } from "react-toastify";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebasem/Store";


function Posts({ post, postID, source }) {
  const { title, desc, date, userID } = post;
  const [isUserDiscVisible, setIsUserDiscVisible] = useState(false);
  const [mousePos, setMousePos] = useState(null);

  const [bloggerData, setBloggerData] = useState(null);
  const [bloggerId, setBloggerId] = useState(null);

  const getBloggerData = async () => {
    try {
      const data = await readData({
        collectionName: "users",
        Id: post.blogger,
      });
      setBloggerId(data.id);
      setBloggerData(data.data());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBloggerData();
  }, []);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const isCurrentUser = bloggerId == currentUser;

  const { stat, error, hasSaved, savedBlogs, saveBlog } = savePost();

  const {
    stat: likeLoading,
    error: likeError,
    hasLiked,
    userLikeCount,
    totalPostLikes: claps,
    likeBlog,
    undoClaps,
  } = likePost();

  useEffect(() => {
    saveBlog({ postID: postID, userID: currentUser });
  }, [currentUser]);

  
  const [commentLength, setCommentLength] = useState(null);

  const getCommentsLength = async () => {
    try {
      const ref = collection(db, "posts", postID, "comments");
      const queryRef = query(ref, where("replyTo", "==", "ORIGINAL"));
      const querySnapShot = await getDocs(queryRef);
      
      setCommentLength(querySnapShot.size);
    } catch (error) {
      console.log(error);
      error.message != "NO_DATA_FOUND" && toast.error("There was some error!");
    } 
  };

  useEffect(() => {
    likeBlog({ postID: postID, userID: currentUser });
    getCommentsLength()
    const interval = setInterval(()=>{
      likeBlog({ postID: postID, userID: currentUser });
      getCommentsLength()
    }, 60000)
    return ()=>clearInterval(interval)
  }, [currentUser]);
  

  return (
    <>
      <div className="text-slate-700 py-4 [&:not(:last-child)]:border-b border-slate-200">
        {source == "profile" && post.pinned && (
          <p className=" mb-4 flex items-center gap-1 text-[0.85rem]">
            <AiOutlinePushpin className="text-xl" /> Pinned
          </p>
        )}
        <Link
          to={`/${bloggerData && bloggerData.username}/${postID}`}
          className=" w-full flex items-center gap-2 justify-between "
        >
          <div className="flex flex-col gap-3 w-[75%]">
            <Link
              to={`/${bloggerData && bloggerData.username}`}
              className="relative w-fit text-[0.85rem] text-slate-800"
              onMouseEnter={(e) => {
                setIsUserDiscVisible(true);
                setMousePos(e);
              }}
              onMouseLeave={(e) => {
                setIsUserDiscVisible(false);
              }}
            >
              <div className="flex gap-4 items-center hover:underline">
                <div className="w-[30px] h-[30px]">
                  <img
                    src={
                      bloggerData &&
                      (bloggerData.userImage
                        ? bloggerData.userImage
                        : profilepic)
                    }
                    className="w-full h-full border rounded-[50%] object-cover object-center"
                    alt=""
                  />
                </div>
                <span>{bloggerData && bloggerData.name}</span>
              </div>
              {isUserDiscVisible && source != "profile" && (
                <UserDiscModal
                  mousePos={mousePos}
                  bloggerID={bloggerId && bloggerId}
                />
              )}
            </Link>
            <div className="flex flex-col gap-2">
              <p className="text-xl sm:text-2xl text-slate-900 font-bold">
                {title}
              </p>
              <p className="text-slate-600">{desc}</p>
            </div>
            <div className="w-full flex justify-between text-[0.85rem]">
              <div className="flex gap-6">
                <p className="flex items-center gap-1"> {date}</p>
                <p className="flex items-center gap-1">
                  
                  {!hasLiked && <PiHandsClappingThin className="text-xl text-slate-950" />}
                  {hasLiked && <PiHandsClappingBold className="text-xl text-slate-950" />}
                  {claps}
                </p>
                <p className="flex items-center gap-1">
                  <FaRegComment className="text-xl text-slate-950" /> {commentLength}
                </p>
              </div>
              {bloggerId != null && !isCurrentUser && hasSaved != null && source != "library" && (
                <div className="">
                  {hasSaved && (
                    <button
                      title="unsave"
                      disabled={stat}
                      onClick={(e) => {
                        saveBlog({
                          postID: postID,
                          userID: currentUser,
                          toggle: true,
                        });
                        e.preventDefault();
                      }}
                    >
                      <BsSaveFill className="text-2xl hover:text-slate-950" />
                    </button>
                  )}
                  {!hasSaved && (
                    <button
                      title="save"
                      disabled={stat}
                      onClick={(e) => {
                        saveBlog({
                          postID: postID,
                          userID: currentUser,
                          toggle: true,
                        });
                        e.preventDefault();
                      }}
                    >
                      <CiSaveDown2 className="text-2xl hover:text-slate-950" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="max-w-[25%] pl-2">
            <img
              src={post.prevImg ? post.prevImg : ""}
              className="w-full object-cover object-center"
              alt=""
            />
          </div>
        </Link>
      </div>
    </>
  );
}

export default Posts;
