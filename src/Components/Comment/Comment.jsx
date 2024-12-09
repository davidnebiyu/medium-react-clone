import React, { forwardRef, useEffect, useRef, useState } from "react";
import { PiHandsClappingBold, PiHandsClappingThin } from "react-icons/pi";
import { Link } from "react-router-dom";
import UserDiscModal from "../UserDiscModal";
import { TextArea } from "../../UI/FormElements";
import Backdrop from "../../UI/Backdrop";
import { FaAngleLeft, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addDataSC,
  deleteScData,
  readData,
  readDataSC,
  updateDataSC,
} from "../../Firebasem/FirestoreF";
import {
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../Firebasem/Store";
import profilepic from "../../assets/profilepic.png";
import DialogModal from "../DialogModal";
import { IoIosMore } from "react-icons/io";
import { data } from "autoprefixer";

const SingleComment = ({
  allComments,
  setAllComments,
  bloggerID,
  comment,
  onCommentAdd,
  postId,
  onSetReply,
  onCommentUpdate,
}) => {
  const [isUserDiscVisible, setIsUserDiscVisible] = useState(false);
  const [mousePos, setMousePos] = useState(null);

  const commentId = comment.commentID;
  const {
    userId,
    comment: commentBody,
    createdAt,
    replyTo,
  } = comment.commentData;

  const currentUser = useSelector((state) => state.auth.currentUser);
  const isCommenterBlogger = bloggerID === userId;
  const isCurrentUser = currentUser === bloggerID;
  const isBloggerUser = currentUser === userId;

  const [hasLiked, setHasLiked] = useState(null);
  const [likeLength, setLikeLength] = useState(null);

  const [userData, setUserData] = useState({});

  const getUser = async () => {
    try {
      const user = await readData({ collectionName: "users", Id: userId });
      setUserData(user.data());
    } catch (error) {
      console.log(error);
    }
  };

  const commentLike = async ({ toggle = false }) => {

    try {
      const commentData = await readDataSC({
        collectionName: "posts",
        subCollectionName: "comments",
        docId: postId,
        subCollId: commentId,
      });

      if (!commentData.data().likes || !commentData.data().likes.length > 0) {
        if (toggle) {

          if(!currentUser){
            return
          }

          const newCommentData = {
            ...commentData.data(),
            likes: [currentUser],
          };
          await updateDataSC({
            collectionName: "posts",
            subCollectionName: "comments",
            docId: postId,
            subCollId: commentId,
            data: newCommentData,
          });
          setLikeLength(1);
          setHasLiked(true);
        } else {
          setLikeLength(0);
          setHasLiked(false);
        }
      } else {
        const liked = commentData.data().likes.find((id) => id == currentUser);

        if (toggle) {
          if(!currentUser){
            return
          }
          if (liked) {
            const newLikes = commentData
              .data()
              .likes.filter((id) => id != currentUser);
            const newCommentData = {
              ...commentData.data(),
              likes: [...newLikes],
            };
            await updateDataSC({
              collectionName: "posts",
              subCollectionName: "comments",
              docId: postId,
              subCollId: commentId,
              data: newCommentData,
            });
            setLikeLength(commentData.data().likes.length - 1);
            setHasLiked(false);
          } else {
            const newCommentData = {
              ...commentData.data(),
              likes: [currentUser, ...commentData.data().likes],
            };
            await updateDataSC({
              collectionName: "posts",
              subCollectionName: "comments",
              docId: postId,
              subCollId: commentId,
              data: newCommentData,
            });
            setLikeLength(commentData.data().likes.length + 1);
            setHasLiked(true);
          }
        } else {
          setLikeLength(commentData.data().likes.length);
          liked ? setHasLiked(true) : setHasLiked(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    commentLike({ toggle: false });
    getReplies();
    const interval = setInterval(() => {
      getReplies();
      commentLike({ toggle: false });
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    getUser();
  }, []);

  const source = "comment";

  const addComment = (comment) => {
    onCommentAdd(comment);
  };

  const [postInfo, setPostInfo] = useState(false);

  const deleteComment = async ({ postId, commentId }) => {
    try {
      await deleteScData({
        collectionName: "posts",
        docId: postId,
        subCollName: "comments",
        subCollId: commentId,
      });
      const filteredComments = allComments.data.filter(
        (comment) => comment.commentID != commentId
      );
      setAllComments((prevData) => ({
        ...prevData,
        data: filteredComments,
      }));
      toast.success("Deleted a Post!");
    } catch (error) {
      console.log(error);
      toast.error("There was some Error!");
    }
  };

  const setReply = ({ reply = false }) => {
    onSetReply((prevData) => ({
      ...prevData,
      visible: true,
      parentCommId: commentId,
      reply: reply,
      postId: postId,
    }));
  };

  const [hasReplies, setHasReplies] = useState(null);

  const getReplies = async () => {
    try {
      const ref = collection(db, "posts", postId, "comments");
      const queryRef = query(
        ref,
        where("replyTo", "==", `${commentId}`),
        orderBy("createdAt", "asc")
      );
      const querySnapShot = await getDocs(queryRef);

      if (querySnapShot.empty) {
        setHasReplies(null);
        throw new Error("NO_REPLIES_FOUND");
      }

      setHasReplies(querySnapShot.size);
    } catch (error) {
      console.log(error);
      error.message != "NO_REPLIES_FOUND" &&
        toast.error("There was some error!");
    }
  };

  // const commentUpdate = ({ postId, commentId, commentBody }) => {
  //   onCommentUpdate({ postId, commentId, commentBody });
  // };

  // const updateComment = async ({ commentId, postId, data }) => {
  //   try {
  //     await updateDataSC({
  //       collectionName: "posts",
  //       docId: postId,
  //       subCollectionName: "comments",
  //       subCollId: commentId,
  //       data: data,
  //     });
  //     setAllComments(
  //       allComments.map((comment) =>
  //         comment.commentID == commentId
  //           ? {
  //               ...comment,
  //               commentData: { ...comment.commentData, comment: data.comment },
  //             }
  //           : comment
  //       )
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <>
      <div className="text-slate-700 py-4 [&:not(:last-child)]:border-b border-slate-200">
        <div className=" w-full flex items-center gap-2 justify-between ">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between">
              <Link
                to={`/${userData && userData.username}`}
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
                        userData &&
                        (userData.userImage ? userData.userImage : profilepic)
                      }
                      className="w-full h-full border rounded-[50%] object-cover object-center"
                      alt=""
                    />
                  </div>
                  <div className="">
                    <span>{userData && userData.name}</span>
                    {isCommenterBlogger && (
                      <span className="text-[0.75rem] text-yellow-600">
                        {" "}
                        - Author
                      </span>
                    )}
                  </div>
                </div>
                {isUserDiscVisible && source != "profile" && (
                  <UserDiscModal
                    mousePos={mousePos}
                    bloggerID={userId && userId}
                  />
                )}
              </Link>
              <div className="relative">
                {(isBloggerUser || isCurrentUser) && (
                  <>
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
                      <ManageComment
                        isCurrentUser={isCurrentUser}
                        openCont={setPostInfo}
                        commentId={commentId}
                        postId={postId}
                        commenterId={userId}
                        bloggerID={bloggerID}
                        isBloggerUser={isBloggerUser}
                        onCommentDelete={deleteComment}
                        onCommentUpdate={onCommentUpdate}
                        commentBody={commentBody}
                      />
                    </DialogModal>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className=" text-slate-900">{commentBody}</p>
            </div>

            <div className="w-full flex justify-between text-[0.85rem]">
              <div className="flex gap-6">
                <button
                  className="flex items-center gap-1 opacity-80 hover:opacity-100"
                  onClick={() => {
                    commentLike({ toggle: true });
                  }}
                  disabled={!currentUser}
                >
                  {!hasLiked && (
                    <PiHandsClappingThin className="text-xl text-slate-950" />
                  )}
                  {hasLiked && (
                    <PiHandsClappingBold className="text-xl text-slate-950" />
                  )}
                  <span>{likeLength && likeLength != 0 ? likeLength : ""}</span>
                </button>
              </div>

              {hasReplies && (
                <button
                  className="hover:underline"
                  onClick={() => {
                    setReply({ reply: false });
                  }}
                >
                  {hasReplies} Replies
                </button>
              )}

              <button
                className="hover:underline"
                onClick={() => {
                  setReply({ reply: true });
                }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const CommentBox = ({
  className,
  onCommentAdd,
  isFocus = false,
  onSetFocus,
  commContent = "",
  onSetCommContent,
  updateMode = {status: null,
    commentId: null,
    postId:null,
    commentBody: null,},
  onSetUpdateMode,
}) => {
  const commentRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.currentUser);

  
  const focusFn = () => {
    if (!currentUser) {
      toast.error("Please Sign in to Comment!");
      commentRef.current.disabled = true;
    }
  };

  const addComment = (comment) => {
    if (!comment.trim() > 0) {
      return;
    }

    if(updateModee.status){
      onCommentAdd({commentId:updateModee.commentId, postId:updateModee.postId, data:{comment:content}});
      cancelComment();
    }else{

      const commentObj = {
        userId: currentUser,
        createdAt: serverTimestamp(),
        comment: comment,
      };
  
      onCommentAdd({comment:commentObj});
  
      cancelComment();
    }
  };

  const cancelComment = () => {
    onSetFocus(false)
    onSetCommContent("")
    setContent("")
    commentRef.current.style.height = "auto";

    onSetUpdateMode((prevData)=>({
        status: null,
    commentId: null,
    postId:null,
    commentBody: null,
      }))
    
  };

  const [content, setContent] = useState(commContent);
  const [updateModee, setUpdateMode] = useState(updateMode)

  const changeHandler = (value) => {
    setContent(value);
  };

  useEffect(() => {
    setContent(commContent);
  }, [commContent]);

  useEffect(()=>{
    setUpdateMode(updateMode)
    updateMode.status ? setContinuetext("Update") : setContinuetext("Comment")    
  }, [updateMode.status, updateMode.commentId])

  useEffect(() => {
    const length = commentRef.current.value.length;
    commentRef.current.setSelectionRange(length, length);
    if (isFocus) {
      commentRef.current.focus();
      commentRef.current.setSelectionRange(length, length); // setting cursor at the end
    } else {
      commentRef.current.blur();
    }
  }, [isFocus, commContent]);
  

  const [continueText, setContinuetext] = useState("Comment")

  return (
    <div className="border px-1 py-2 shadow-md mt-4 text-[0.85rem]">
      <CommnetBoxUI
        ref={commentRef}
        onCommentAdd={addComment}
        placeholder="What are Your thoughts?"
        currentUser={currentUser}
        onChangeContent={changeHandler}
        onCancelComment={cancelComment}
        content={content}
        onFocus={focusFn}
        continueText = {continueText}
      />
    </div>
  );
};




function Comment({ onChangeDisp, isVisible, postId, bloggerID }) {
  const [comments, setComments] = useState({
    error: null,
    loading: null,
    data: [],
  });

  const currentUser = useSelector((state) => state.auth.currentUser);

  const [hasRunOnce, setHasRunOnce] = useState(false);

  const [commentLength, setCommentLength] = useState(null);

  const getComments = async () => {
    setComments((prevData) => ({
      ...prevData,
      error: null,
      loading: true,
    }));
    try {
      const ref = collection(db, "posts", postId, "comments");
      const queryRef = query(
        ref,
        where("replyTo", "==", "ORIGINAL"),
        orderBy("createdAt", "asc")
      );
      const querySnapShot = await getDocs(queryRef);

      if (querySnapShot.empty) {
        setHasRunOnce(true);
        setCommentLength(0);
        throw new Error("NO_DATA_FOUND");
      }

      const arr = [];

      querySnapShot.forEach(async (snap) => {
        return arr.push({ commentID: snap.id, commentData: snap.data() });
      });

      setComments((prevData) => ({
        ...prevData,
        data: arr,
      }));

      setHasRunOnce(true);
      setCommentLength(querySnapShot.size);
    } catch (error) {
      console.log(error);
      setComments((prevData) => ({
        ...prevData,
        error: error,
      }));
      setCommentLength(null);
      error.message != "NO_DATA_FOUND" && toast.error("There was some error!");
    } finally {
      setComments((prevData) => ({
        ...prevData,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    if (!isVisible || hasRunOnce) {
      return;
    }
    getComments();
    console.log("Effect Runs");
  }, [isVisible, hasRunOnce]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHasRunOnce(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const addComment = async ({comment, commentId, postId:postID, data}) => {

    if(updateMode.status){

      updateComment({commentId:commentId, postId:postId, data:data})    

    }else{

      comment.replyTo = "ORIGINAL";

      try {
        await addDataSC({
          collectionName: "posts",
          subCollectionName: "comments",
          docId: postId,
          data: comment,
        });
        setHasRunOnce(false);
      } catch (error) {
        console.log(error);
      }
    }

  };

  const [isReply, setIsReply] = useState({
    visible: false,
    parentCommId: null,
    postId: null,
    reply: false,
  });

  const [updateMode, setUpdateMode] = useState({
    status: null,
    commentId: null,
    postId:null,
    commentBody: null,
  });
  const [commContent, setCommContent] = useState("");
  const [commBoxFocus, setCommBoxFocus] = useState(null);

  const commentUpdate = ({ postId, commentId, commentBody }) => {
    setUpdateMode({
      status: true,
      postId,
      commentId,
      commentBody,
    });
    setCommContent(commentBody + " ");
    setCommBoxFocus(true);
  };

  const updateComment = async ({ commentId, postId, data }) => {

    try {
      await updateDataSC({
        collectionName: "posts",
        docId: postId,
        subCollectionName: "comments",
        subCollId: commentId,
        data: data,
      });
      setComments((prevData)=>({
        ...prevData,
        data:comments.data.map((comm) =>
          comm.commentID == commentId
            ? {
                ...comm,
                commentData: { ...comm.commentData, comment: data.comment },
              }
            : comm
        )
      })
      );
      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isVisible && (
        <Backdrop
          transparent="semi"
          onClick={() => {
            onChangeDisp(false);
            setIsReply((prevData) => ({ ...prevData, visible: false }));
          }}
        />
      )}
      <div
        className={`fixed top-0  bg-white h-[100vh] overflow-auto w-full right-0 z-[600] md:w-[400px] py-8 px-6 transform  transition-transform duration-500 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between">
          {isReply.visible ? (
            <>
              <button
                onClick={() => {
                  setIsReply((prevData) => ({ ...prevData, visible: false }));
                }}
              >
                <FaAngleLeft className="text-xl text-slate-950" />
              </button>
              <p className="font-bold text-xl">Replies</p>
            </>
          ) : (
            <p className="font-bold text-xl">
              Responses ({commentLength && commentLength})
            </p>
          )}
          <button
            onClick={() => {
              onChangeDisp(false);
              setIsReply((prevData) => ({ ...prevData, visible: false }));
            }}
          >
            <FaTimes className="text-xl text-slate-950" />
          </button>
        </div>

        {!isReply.visible && (
          <>
            <CommentBox
              className="mt-6"
              onCommentAdd={addComment}
              updateMode={updateMode}
              commContent={commContent}
              isFocus={commBoxFocus}
              onSetUpdateMode={setUpdateMode}
              onSetCommContent={setCommContent}
              onSetFocus={setCommBoxFocus}
            />

            <div className="mt-6">
              {comments.loading && (
                <div className="flex justify-center pt-8">
                  <div className="loader small"></div>
                </div>
              )}

              {!comments.loading && !comments.data.length > 0 ? (
                <p className="font-bold">No Comments Yet</p>
              ) : (
                !comments.loading &&
                comments.data.map((comment) => (
                  <SingleComment
                    bloggerID={bloggerID}
                    comment={comment}
                    postId={postId}
                    onCommentAdd={addComment}
                    key={comment.commentID}
                    allComments={comments}
                    setAllComments={setComments}
                    onSetReply={setIsReply}
                    onCommentUpdate={commentUpdate}
                  />
                ))
              )}
            </div>
          </>
        )}

        {isReply.visible && (
          <Replies
            ReplyData={isReply}
            isRepVisible={isReply.visible}
            bloggerID={bloggerID}
          />
        )}
      </div>
    </>
  );
}

export default Comment;

const ManageComment = ({
  commentId,
  openCont,
  commenterId,
  postId,
  isCurrentUser,
  bloggerID,
  isBloggerUser,
  onCommentDelete,
  onCommentUpdate,
  commentBody,
}) => {
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [deleteDisp, setDeleteDisp] = useState(false);

  return (
    <>
      <div className="bg-white absolute top-4 right-1 flex flex-col border items-start py-2 px-4 gap-2 text-slate-700 z-[500] ">
        {isBloggerUser && (
          <button
            className="hover:text-slate-950 w-fit text-nowrap py-1"
            onClick={() => {
              onCommentUpdate({
                postId: postId,
                commentId: commentId,
                commentBody: commentBody,
              });
              openCont(null);
            }}
          >
            Update Comment
          </button>
        )}
        {(isCurrentUser || isBloggerUser) && (
          <>
            <button
              onClick={() => {
                setDeleteDisp(true);
              }}
              className="thover:text-slate-950 w-fit text-nowrap py-1"
            >
              Delete Comment
            </button>
            <DialogModal
              isOpen={deleteDisp}
              title="Are you sure to Delete?"
              type={"confirm"}
              onConfirm={() => {
                onCommentDelete({ postId: postId, commentId: commentId });
              }}
              onClose={() => {
                setDeleteDisp(false);
                openCont(null);
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

const Replies = ({ isRepVisible, ReplyData, bloggerID }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { parentCommId, postId, reply } = ReplyData;

  const addComment = async ({comment, commentId, postId:postID, data}) => {
    
    if(updateMode.status){
      updateComment({commentId:commentId, postId:postId, data:data})    
    }else{
      comment.replyTo = `${parentCommId}`;
      
      try {
        await addDataSC({
          collectionName: "posts",
          subCollectionName: "comments",
          docId: postId,
          data: comment,
        });
        setHasRunOnce(false);
      } catch (error) {
        console.log(error);
      }
    }

  };

  const [replies, setReplies] = useState({
    error: null,
    loading: null,
    data: [],
  });

  const [hasRunOnce, setHasRunOnce] = useState(false);

  useEffect(() => {
    if (!isRepVisible || hasRunOnce) {
      return;
    }
    getReplies();
  }, [isRepVisible, hasRunOnce]);

  useEffect(() => {
    getParentComment();
    const interval = setInterval(() => {
      getParentComment();
      setHasRunOnce(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const [parentCommment, setParentComment] = useState({
    commentID: null,
    commentData: null,
  });

  const getParentComment = async () => {
    try {
      const comment = await readDataSC({
        collectionName: "posts",
        docId: postId,
        subCollectionName: "comments",
        subCollId: parentCommId,
      });

      setParentComment((prevData) => ({
        commentID: parentCommId,
        commentData: comment.data(),
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const getReplies = async () => {
    setReplies((prevData) => ({
      ...prevData,
      error: null,
      loading: true,
    }));
    try {
      const ref = collection(db, "posts", postId, "comments");
      const queryRef = query(
        ref,
        where("replyTo", "==", `${parentCommId}`),
        orderBy("createdAt", "asc")
      );
      const querySnapShot = await getDocs(queryRef);

      if (querySnapShot.empty) {
        setHasRunOnce(true);
        // setCommentLength(0);
        throw new Error("NO_DATA_FOUND");
      }

      const arr = [];

      querySnapShot.forEach(async (snap) => {
        return arr.push({ commentID: snap.id, commentData: snap.data() });
      });

      setReplies((prevData) => ({
        ...prevData,
        data: arr,
      }));

      setHasRunOnce(true);
    } catch (error) {
      console.log(error);
      setReplies((prevData) => ({
        ...prevData,
        error: error,
      }));
      error.message != "NO_DATA_FOUND" && toast.error("There was some error!");
    } finally {
      setReplies((prevData) => ({
        ...prevData,
        loading: false,
      }));
    }
  };

  const [commContent, setCommContent] = useState("");
  const [commBoxFocus, setCommBoxFocus] = useState(reply);

  const [updateMode, setUpdateMode] = useState({
    status: null,
    commentId: null,
    postId:null,
    commentBody: null,
  });

  const commentUpdate = ({ postId, commentId, commentBody }) => {
    setUpdateMode({
      status: true,
      postId,
      commentId,
      commentBody,
    });
    setCommContent(commentBody + " ");
    setCommBoxFocus(true);
  };

  const updateComment = async ({ commentId, postId, data }) => {
    try {
      await updateDataSC({
        collectionName: "posts",
        docId: postId,
        subCollectionName: "comments",
        subCollId: commentId,
        data: data,
      });
      setReplies((prevData)=>({
        ...prevData,
        data:replies.data.map((comment) =>
          comment.commentID == commentId
            ? {
                ...comment,
                commentData: { ...comment.commentData, comment: data.comment },
              }
            : comment
        )
      })
        
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <CommentBox
        className="mt-6"
        onCommentAdd={addComment}
        isFocus={commBoxFocus}
        commContent={commContent}
        updateMode={updateMode}
        onSetUpdateMode={setUpdateMode}
        onSetCommContent={setCommContent}
        onSetFocus={setCommBoxFocus}
      />

      <div className="my-4 border-b border-slate-200">
        {parentCommment.commentData && (
          <SingleCommRep
            comment={parentCommment}
            bloggerID={bloggerID}
            postId={postId}
            onSetCommentRep={setCommContent}
            onCommBoxFocus={setCommBoxFocus}
          />
        )}
      </div>

      {replies.loading && (
        <div className="flex justify-center">
          <div className="loader small"></div>
        </div>
      )}
      {!replies.loading &&
        !replies.error &&
        replies.data.length > 0 &&
        replies.data.map((comment) => (
          <div className="pl-6">
            <SingleCommRep
              comment={comment}
              bloggerID={bloggerID}
              postId={postId}
              key={comment.commentID}
              setAllComments={setReplies}
              allComments={replies}
              onSetCommentRep={setCommContent}
              onCommBoxFocus={setCommBoxFocus}
              onCommentUpdate={commentUpdate}
            />
          </div>
        ))}
    </>
  );
};

const SingleCommRep = ({
  comment,
  bloggerID,
  postId,
  setAllComments,
  allComments,
  onSetCommentRep,
  onCommBoxFocus,
  onCommentUpdate
}) => {
  const [isUserDiscVisible, setIsUserDiscVisible] = useState(false);
  const [mousePos, setMousePos] = useState(null);

  const commentId = comment.commentID;
  const {
    userId,
    comment: commentBody,
    createdAt,
    replyTo,
  } = comment.commentData;

  const currentUser = useSelector((state) => state.auth.currentUser);
  const isCommenterBlogger = bloggerID === userId;
  const isCurrentUser = currentUser === bloggerID;
  const isBloggerUser = currentUser === userId;

  const [hasLiked, setHasLiked] = useState(null);
  const [likeLength, setLikeLength] = useState(null);

  const [userData, setUserData] = useState({});

  const getUser = async () => {
    try {
      const user = await readData({ collectionName: "users", Id: userId });
      setUserData(user.data());
    } catch (error) {
      console.log(error);
    }
  };

  const commentLike = async ({ toggle = false }) => {

    try {
      const commentData = await readDataSC({
        collectionName: "posts",
        subCollectionName: "comments",
        docId: postId,
        subCollId: commentId,
      });

      if (!commentData.data().likes || !commentData.data().likes.length > 0) {
        if (toggle) {

          if(!currentUser){
            return
          }

          const newCommentData = {
            ...commentData.data(),
            likes: [currentUser],
          };
          await updateDataSC({
            collectionName: "posts",
            subCollectionName: "comments",
            docId: postId,
            subCollId: commentId,
            data: newCommentData,
          });
          setLikeLength(1);
          setHasLiked(true);
        } else {
          setLikeLength(0);
          setHasLiked(false);
        }
      } else {
        const liked = commentData.data().likes.find((id) => id == currentUser);

        if (toggle) {

          if(!currentUser){
            return
          }

          if (liked) {
            const newLikes = commentData
              .data()
              .likes.filter((id) => id != currentUser);
            const newCommentData = {
              ...commentData.data(),
              likes: [...newLikes],
            };
            await updateDataSC({
              collectionName: "posts",
              subCollectionName: "comments",
              docId: postId,
              subCollId: commentId,
              data: newCommentData,
            });
            setLikeLength(commentData.data().likes.length - 1);
            setHasLiked(false);
          } else {
            const newCommentData = {
              ...commentData.data(),
              likes: [currentUser, ...commentData.data().likes],
            };
            await updateDataSC({
              collectionName: "posts",
              subCollectionName: "comments",
              docId: postId,
              subCollId: commentId,
              data: newCommentData,
            });
            setLikeLength(commentData.data().likes.length + 1);
            setHasLiked(true);
          }
        } else {
          setLikeLength(commentData.data().likes.length);
          liked ? setHasLiked(true) : setHasLiked(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    commentLike({ toggle: false });

    const interval = setInterval(() => {
      commentLike({ toggle: false });
    }, 60000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    getUser();
  }, []);

  const source = "comment";

  const setReply = ({ name }) => {
    onSetCommentRep(name + " ");
    onCommBoxFocus(true);
  };

  const [postInfo, setPostInfo] = useState(false);

  const deleteComment = async ({ postId, commentId }) => {
    try {
      await deleteScData({
        collectionName: "posts",
        docId: postId,
        subCollName: "comments",
        subCollId: commentId,
      });
      const filteredComments = allComments.data.filter(
        (comment) => comment.commentID != commentId
      );
      setAllComments((prevData) => ({
        ...prevData,
        data: filteredComments,
      }));
      toast.success("Deleted a Post!");
    } catch (error) {
      console.log(error);
      toast.error("There was some Error!");
    }
  };

  return (
    <>
      <div className="text-slate-700 py-4 [&:not(:last-child)]:border-b border-slate-200">
        <div className=" w-full flex items-center gap-2 justify-between ">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex justify-between">
              <Link
                to={`/${userData && userData.username}`}
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
                        userData &&
                        (userData.userImage ? userData.userImage : profilepic)
                      }
                      className="w-full h-full border rounded-[50%] object-cover object-center"
                      alt=""
                    />
                  </div>
                  <div className="">
                    <span>{userData && userData.name}</span>
                    {isCommenterBlogger && (
                      <span className="text-[0.75rem] text-yellow-600">
                        {" "}
                        - Author
                      </span>
                    )}
                  </div>
                </div>
                {isUserDiscVisible && source != "profile" && (
                  <UserDiscModal
                    mousePos={mousePos}
                    bloggerID={userId && userId}
                  />
                )}
              </Link>
              <div className="relative">
                {(isBloggerUser || isCurrentUser) && (
                  <>
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
                      <ManageComment
                        isCurrentUser={isCurrentUser}
                        openCont={setPostInfo}
                        commentId={commentId}
                        postId={postId}
                        commenterId={userId}
                        bloggerID={bloggerID}
                        isBloggerUser={isBloggerUser}
                        onCommentDelete={deleteComment}
                        onCommentUpdate={onCommentUpdate}
                        commentBody={commentBody}
                      />
                    </DialogModal>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className=" text-slate-900">{commentBody}</p>
            </div>

            <div className="w-full flex justify-between text-[0.85rem]">
              <div className="flex gap-6">
                <button
                  className="flex items-center gap-1 opacity-80 hover:opacity-100"
                  onClick={() => {
                    commentLike({ toggle: true });
                  }}
                >
                  {!hasLiked && (
                    <PiHandsClappingThin className="text-xl text-slate-950" />
                  )}
                  {hasLiked && (
                    <PiHandsClappingBold className="text-xl text-slate-950" />
                  )}
                  <span>{likeLength && likeLength != 0 ? likeLength : ""}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setReply({ name: userData.name });
                }}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const CommnetBoxUI = forwardRef(
  (
    {
      currentUser,
      className,
      onCommentAdd,
      onCancelComment,
      onFocus,
      placeholder,
      content,
      onChangeContent,
      continueText="Comment"
    },
    ref
  ) => {
    return (
      <>
        <TextArea
          ref={ref}
          className={className}
          placeholder={placeholder}
          onfocus={onFocus}
          content={content}
          changeHandler={onChangeContent}
        />
        {currentUser && (
          <div className="flex gap-4 justify-end">
            <button
              onClick={onCancelComment}
              className="bg-red-500 text-white px-4 py-1 rounded-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onCommentAdd(content);
              }}
              className="bg-blue-500 text-white px-4 py-1 rounded-sm"
            >
              {continueText}
            </button>
          </div>
        )}
      </>
    );
  }
);
