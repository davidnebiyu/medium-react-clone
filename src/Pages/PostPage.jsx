import React, { useEffect, useState } from "react";
import Post from "../Components/Post";
import { useNavigate, useParams } from "react-router-dom";
import { readData } from "../Firebasem/FirestoreF";
import Loading from "../UI/Loading";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebasem/Store";
import { checkFollowStat, checkUser } from "../Hooks/AuthValidation";
import { useSelector } from "react-redux";

function PostPage() {
  const param = useParams();
  const navigate = useNavigate();  

  const POST_ID = param.POST_ID;
  const POST_UNAME = param.username;

  const [post, setPost] = useState({ loading: true, data: null });
  const [bloggerData, setBloggerData] = useState(null);

  const currentUser = useSelector((state) => state.auth.currentUser);

  const currentUsername = useSelector((state) => state.auth.currentUserData ? state.auth.currentUserData.username : null);
  
  const getPost = async () => {
    try {
      const isPost = await readData({ collectionName: "posts", Id: POST_ID });

      if (!isPost.exists()) {
        navigate("/");
      }

      if (isPost.data().status != "PUBLISHED") {
        navigate("/");
      }

      const BloggerRef = collection(db, "users");
      const BloggerQuery = query(
        BloggerRef,
        where("username", "==", POST_UNAME)
      );
      const BloggerSnap = await getDocs(BloggerQuery);

      if (BloggerSnap.empty) {
        navigate("/");
      }

      const BlogerID = BloggerSnap.docs.map((item) => {
        return { id: item.id, data: item.data() };
      });

      if (isPost.data().blogger != BlogerID[0].id) {
        navigate("/");
      }

      setPost((prevData) => ({
        ...prevData,
        loading: false,
        data: { id: isPost.id, data: isPost.data() },
      }));

      setBloggerData({ id: BlogerID[0].id, data: BlogerID[0].data });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getPost();
  }, [param]);

  const { userLoading, error, isCurrentUser, paramUserId, isloggedIn } =
  checkUser({
    username: POST_UNAME,
    dependency: [param, currentUser],
  });
  
  const {
    loading: followLoading,
    error: followError,
    stat: followStat,
    checkStat,
  } = checkFollowStat();
  


  useEffect(() => {
    if (!bloggerData) {
      return;
    }

    checkStat({ user1ID: currentUser, user2ID: bloggerData.id });
  }, [param, currentUser, bloggerData]);

  return (
    <>
      {post.loading || userLoading ? (
        <Loading />
      ) : (
        <div className="blogWrapper">
          <div className="px-6 py-8  relative mt-10">
            <Post
              postData={post.data.data}
              blogID={post.data.id}
              bloggerID={bloggerData.id}
              bloggerData={bloggerData.data}
              isCurrentUser={isCurrentUser}
              isLoggedIn={isloggedIn}
              followStat={followStat}
              onSetFollow={checkStat}
              followLoading={followLoading}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default PostPage;
