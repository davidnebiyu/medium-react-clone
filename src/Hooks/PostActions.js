import React, { useState } from "react";
import { readData, updateData } from "../Firebasem/FirestoreF";
import { toast } from "react-toastify";
import { increment, serverTimestamp } from "firebase/firestore";

export const savePost = () => {
  const [stat, setStat] = useState(null);
  const [error, setError] = useState(null);

  const [savedBlogs, setSavedBlogs] = useState([]);
  const [hasSaved, setHasSaved] = useState(null);

  const saveBlog = async ({ postID, userID, toggle = false }) => {
    if (userID == null) {
      return;
    }

    try {
      setStat(true);
      setError(null);

      const userData = await readData({ collectionName: "users", Id: userID });
      const saves = userData.data().library;

      if (!saves || !saves.length > 0) {
        setSavedBlogs([]);
        setHasSaved(false);
        if (!toggle) {
          throw new Error("EMPTY_LIBRARY");
        }
      }

      if (saves) {
        setSavedBlogs([...saves]);
        if (!postID) {
          return;
        }

        const blogIDs = saves.map((save) => save.blogID);

        if (blogIDs.includes(postID)) {
          setHasSaved(true);
          if (!toggle) {
            return;
          }
        } else {
          setHasSaved(false);
          if (!toggle) {
            return;
          }
        }
      }

      if (toggle) {
        if (saves) {
          const blogIDs = saves.map((save) => save.blogID);

          if (blogIDs.includes(postID)) {
            const newSavedBlogs = saves.filter((save) => save.blogID != postID);
            await updateData({
              collectionName: "users",
              Id: userID,
              data: { library: [...newSavedBlogs] },
            });
            setSavedBlogs([...newSavedBlogs]);
            setHasSaved(false);
          } else {
            const savedBlog = { blogID: postID, added: new Date() };
            await updateData({
              collectionName: "users",
              Id: userID,
              data: { library: [savedBlog, ...saves] },
            });
            setSavedBlogs([savedBlog, ...saves]);
            setHasSaved(true);
          }
        } else {
          const savedBlog = { blogID: postID, added: new Date() };
          await updateData({
            collectionName: "users",
            Id: userID,
            data: { library: [savedBlog] },
          });
          setSavedBlogs([savedBlog]);
          setHasSaved(true);
        }
      }
    } catch (error) {
      setError(error.message);
      console.log(error);
      error.message != "EMPTY_LIBRARY" && toast.error("There was some Error!");
    } finally {
      setStat(false);
    }
  };

  return {
    stat,
    hasSaved,
    error,
    savedBlogs,
    saveBlog,
  };
};

export const likePost = () => {
  const [stat, setStat] = useState(null);
  const [error, setError] = useState(null);

  const [usersLiked, setUsersLiked] = useState([]);
  const [hasLiked, setHasLiked] = useState(null);
  const [userLikeCount, setUserLikeCount] = useState(null);
  const [totalPostLikes, setTotalPostLikes] = useState(null)

  const likeBlog = async ({ postID, userID, toggle = false }) => {
    try {
      setStat(true);
      setError(false);
      
      const postData = await readData({ collectionName: "posts", Id: postID });
      const totalPostLikesCount = postData.data().likes

      setTotalPostLikes(totalPostLikesCount)

      
      const userData = await readData({ collectionName: "users", Id: userID });
      const likes = userData.data().likes;


      if (!likes || !likes.length > 0) {
        setHasLiked(false);
        setUserLikeCount(0);
        if (!toggle) {
          return;
        }
      }

      if (likes) {
        const blogIDs = likes.map((like) => like.blogID);

        if (blogIDs.includes(postID)) {
          const likeCount = likes.filter((like) => like.blogID == postID)[0]
            .size;
          setUserLikeCount(likeCount);
          setHasLiked(true);
        } else {
          setHasLiked(false);
          setUserLikeCount(0);
          if (!toggle) {
            return;
          }
        }
      }

      if (toggle) {
        if (likes) {
          const blogIDs = likes.map((like) => like.blogID);

          if (blogIDs.includes(postID)) {
            if (userLikeCount < 3) {

              const prevLikeCount = likes.find((like)=>like.blogID == postID).size
              likes.find((like)=>like.blogID == postID).size = prevLikeCount + 1

              await updateData({
                collectionName: "users",
                Id: userID,
                data: { likes: [...likes] },
              });

              await updateData({
                collectionName: "posts",
                Id: postID,
                data: { likes: increment(1) },
              });

              setUserLikeCount(prevLikeCount + 1);
              setTotalPostLikes(totalPostLikesCount + 1)
              setHasLiked(true);
            } 
           
          } else {
            const newLike = { size: 1, blogID: postID, liked: new Date() };

            await updateData({
              collectionName: "users",
              Id: userID,
              data: { likes: [newLike, ...likes] },
            });
            await updateData({
              collectionName: "posts",
              Id: postID,
              data: { likes: increment(1) },
            });

            setUserLikeCount(1);
            setTotalPostLikes(totalPostLikesCount + 1)
            setHasLiked(true);
          }
        } else {
          const newLike = { size: 1, blogID: postID, liked: new Date() };

          await updateData({
            collectionName: "users",
            Id: userID,
            data: { likes: [newLike] },
          });
          await updateData({
            collectionName: "posts",
            Id: postID,
            data: { likes: increment(1) },
          });

          setUserLikeCount(1);
          setTotalPostLikes(totalPostLikesCount + 1)
          setHasLiked(true);
        }
      }
    } catch (error) {
      setError(error.message);
      console.log(error);
    } finally {
      setStat(false);
    }
  };

  const undoClaps = async ({ postID, userID }) => {

    try {

      setStat(true);
      setError(false);

      const userData = await readData({ collectionName: "users", Id: userID });
      const likes = userData.data().likes;

      const postData = await readData({ collectionName: "posts", Id: postID });
      const prevPostLikesCount = postData.data().likes

      const prevUserLikeCount = likes.find((like)=>like.blogID == postID).size

      const newLikes = likes.filter((like)=>like.blogID != postID)

      await updateData({
        collectionName: "users",
        Id: userID,
        data: { likes: [...newLikes] },
      });
      await updateData({
        collectionName: "posts",
        Id: postID,
        data: { likes: prevPostLikesCount - prevUserLikeCount },
      });

      setUserLikeCount(0);
      setTotalPostLikes( prevPostLikesCount - prevUserLikeCount)
      setHasLiked(false);
    } catch (error) {
      console.log(error);
      setError(error.message);
    }finally{
      setStat(false);
    }
  };

return {stat, error, hasLiked, userLikeCount, totalPostLikes, likeBlog, undoClaps}
};
