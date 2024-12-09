import React, { useEffect, useState } from "react";
import { CiSaveDown2 } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { PiHandsClappingThin } from "react-icons/pi";
import { IoIosMore } from "react-icons/io";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";
import moment from "moment";
import hljs from "highlight.js";
import { toast } from "react-toastify";
import DialogModal from "./DialogModal";
import { useDispatch, useSelector } from "react-redux";
import { uiAction } from "../Store/Store";
import Signin from "./Signin";
import { likePost, savePost } from "../Hooks/PostActions";
import { BsSaveFill } from "react-icons/bs";
import { PiHandsClappingBold } from "react-icons/pi";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebasem/Store";
import { readData } from "../Firebasem/FirestoreF";
import Comment from "./Comment/Comment";

function Post({
  status,
  preview,
  postData,
  bloggerData,
  bloggerID,
  followStat,
  isCurrentUser,
  isLoggedIn,
  blogID,
  onSetFollow,
  followLoading,
}) {
  const { title, content: note, comments } = postData;

  const [content, setContent] = useState(null);

  const highlightCode = (content) => {
    const container = document.createElement("div");
    container.innerHTML = content;
    const codeBlocks = container.querySelectorAll("pre");
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block);
    });
    setContent(container.innerHTML);
  };

  const estimateReadingTime = (text) => {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.trim().split(/\s+/).length; // Split text into words
    const minutes = Math.ceil(words / wordsPerMinute); // Calculate minutes and round up

    return minutes;
  };
  const min = estimateReadingTime(note);

  useEffect(() => {
    highlightCode(note);
  }, [note]);

  const {
    name: bloggerName,
    userImage: bloggerImgurl,
    username: bloggerUsername,
  } = preview ? "" : bloggerData;

  const date = preview
    ? ""
    : moment(new Date(`${postData.timeStamp.seconds}` * 1000)).calendar();

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      toast.info("Link Copied!", { hideProgressBar: true, autoClose: 500 });
    } catch (err) {
      console.error("Failed to copy the URL:", err);
    }
  };

  const [postInfo, setPostInfo] = useState(false);

  const currentUser = useSelector((state) => state.auth.currentUser);

  const dispatch = useDispatch();

  const toggleFollow = () => {
    if (!currentUser) {
      dispatch(uiAction.setModalElement(Signin));
      return;
    }

    onSetFollow({ user1ID: currentUser, user2ID: bloggerID, toggle: true });
  };

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
    saveBlog({ postID: blogID, userID: currentUser });
  }, [currentUser]);

  useEffect(() => {
    likeBlog({ postID: blogID, userID: currentUser });
    getCommentsLength();
    const interval = setInterval(() => {
      likeBlog({ postID: blogID, userID: currentUser });
      getCommentsLength();
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const toggleLike = () => {
    if (!currentUser) {
      dispatch(uiAction.setModalElement(Signin));
      return;
    }

    likeBlog({ postID: blogID, userID: currentUser, toggle: true });
  };

  const [commentLength, setCommentLength] = useState(null);

  const getCommentsLength = async () => {
    try {
      const ref = collection(db, "posts", blogID, "comments");
      const queryRef = query(ref, where("replyTo", "==", "ORIGINAL"));
      const querySnapShot = await getDocs(queryRef);

      setCommentLength(querySnapShot.size);
    } catch (error) {
      setCommentLength(querySnapShot.size);
      error.message != "NO_DATA_FOUND" && toast.error("There was some error!");
    } finally {
    }
  };

  const [commentDisp, setCommentDisp] = useState(false);

  return (
    <>
      <Comment
        bloggerID={bloggerID}
        isVisible={commentDisp}
        postId={blogID}
        onChangeDisp={setCommentDisp}
      />
      <div className="flex flex-col gap-10 mt-6">
        <p className="capitalize font-semibold text-3xl sm:text-[40px] text-center mb-4">
          {" "}
          {title}{" "}
        </p>
        {!preview && (
          <>
            <div className="flex gap-4 items-center">
              <div className="w-[44px] h-[44px]">
                {" "}
                <Link to={`/${bloggerUsername}`}>
                  <img
                    src={bloggerImgurl}
                    alt=""
                    className="w-full h-full object-center object-cover rounded-[50%]"
                  />
                </Link>{" "}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <p className="hover:underline">
                    <Link to={`/${bloggerUsername}`}>{bloggerName}</Link>
                  </p>
                  {!isCurrentUser && (
                    <>
                      <p>-</p>
                      <button
                        disabled={currentUser && followLoading}
                        onClick={toggleFollow}
                        className="text-slate-700 hover:text-inherit hover:underline"
                      >
                        {followStat ? "Following" : "Follow"}
                      </button>
                    </>
                  )}
                </div>
                <div className="text-[0.85rem] text-slate-700 flex gap-3">
                  <p>{min} min read</p>
                  <p>-</p>
                  <p>{date}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-4 border-y py-3">
              <div className="flex gap-8">
                <p className="flex items-center gap-2 text-[0.85rem]">
                  <div className="flex items-center">
                    {!hasLiked && (
                      <button
                        onClick={toggleLike}
                        className="text-slate-700 hover:text-inherit"
                      >
                        <PiHandsClappingThin className="text-2xl" />
                      </button>
                    )}
                    {hasLiked && (
                      <button
                        onClick={toggleLike}
                        className="text-slate-700 hover:text-inherit"
                      >
                        <PiHandsClappingBold className="text-2xl" />
                      </button>
                    )}
                    {hasLiked && (
                      <span
                        title="Your Claps"
                        className="text-[0.85rem] text-slate-700 "
                      >
                        ({userLikeCount})
                      </span>
                    )}
                  </div>
                  <button className="text-slate-700 hover:text-inherit">
                    <span>{claps}</span>
                  </button>
                </p>
                <button
                  className="flex items-center gap-1 text-slate-700 hover:text-inherit"
                  onClick={() => {
                    setCommentDisp(true);
                  }}
                >
                  <FaRegComment className="text-2xl" /> {commentLength}
                </button>
              </div>
              <div className="flex gap-8 ">
                {bloggerID != null && !isCurrentUser && hasSaved != null && (
                  <div className="">
                    {hasSaved && (
                      <button
                        title="unsave"
                        disabled={stat}
                        onClick={(e) => {
                          saveBlog({
                            postID: blogID,
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
                            postID: blogID,
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
                <button title="copy link" onClick={handleCopyLink}>
                  <FaLink className="text-xl text-slate-700 hover:text-inherit" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => {
                      setPostInfo(!postInfo);
                    }}
                    className="text-2xl text-slate-700 hover:text-inherit"
                  >
                    <IoIosMore />
                  </button>
                  <DialogModal
                    isOpen={postInfo}
                    type="sidebar"
                    onClose={() => {
                      setPostInfo(false);
                    }}
                  >
                    <ManagePost
                      id={blogID}
                      isCurrentUser={isCurrentUser}
                      claps={claps}
                      openCont={setPostInfo}
                      onSetFollow={onSetFollow}
                      bloggerID={bloggerID}
                      hasLiked={hasLiked}
                      onUndoClaps={undoClaps}
                      postID={blogID}
                    />
                  </DialogModal>
                </div>
              </div>
            </div>
          </>
        )}
        <div
          className="blogContent  "
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </>
  );
}

export default Post;

const ManagePost = ({
  id,
  openCont,
  isCurrentUser,
  bloggerID,
  onSetFollow,
  hasLiked,
  onUndoClaps,
  postID,
}) => {
  const currentUser = useSelector((state) => state.auth.currentUser);

  const undoLikes = () => {
    onUndoClaps({ postID: postID, userID: currentUser });
    openCont(false);
  };

  return (
    <>
      <div className="bg-white absolute top-4 right-1 flex flex-col border items-start py-2 px-4 gap-2 text-slate-700 z-[500] ">
        {isCurrentUser && (
          <button className="hover:text-slate-950 w-fit text-nowrap py-1">
            {" "}
            <Link to={`/write?post=${id}&source=PUBLISHED`}>
              Edit Blog
            </Link>{" "}
          </button>
        )}
        {hasLiked && (
          <button
            className="thover:text-slate-950 w-fit text-nowrap py-1"
            onClick={undoLikes}
          >
            Undo Claps
          </button>
        )}
      </div>
    </>
  );
};
