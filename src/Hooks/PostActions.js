import React, { useState } from "react";
import { readData, updateData } from "../Firebasem/FirestoreF";
import { toast } from "react-toastify";
import { serverTimestamp } from "firebase/firestore";

export const savePost = () => {
  const [stat, setStat] = useState(null);
  const [error, setError] = useState(null);

  const [savedBlogs, setSavedBlogs] = useState([])
  const [hasSaved, setHasSaved] = useState(null);

  const saveBlog = async({
    postID,
    userID,
    toggle = false,
  })=>{

    if(userID == null){
        return
    }

      try {
        setStat(true);
        setError(null);
    
        const userData = await readData({ collectionName: "users", Id: userID });
        const saves = userData.data().library;
        
        if (!saves || !saves.length > 0) {
          setSavedBlogs([])
          setHasSaved(false);
          if (!toggle) {
            throw new Error("EMPTY_LIBRARY")
          }
        }
    
        if (saves) {
          setSavedBlogs([...saves])
          if(!postID){
            return
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
    
        if(toggle){
            if(saves){
                const blogIDs = saves.map((save) => save.blogID);
    
                if (blogIDs.includes(postID)) {
                    
                    const newSavedBlogs = saves.filter((save)=>save.blogID != postID)
                    await updateData({collectionName:'users', Id:userID, data:{library:[...newSavedBlogs]}})
                    setSavedBlogs([...newSavedBlogs])
                    setHasSaved(false);
    
                  } else {
                      const savedBlog = {blogID:postID, added:new Date()}
                      await updateData({collectionName:'users', Id:userID, data:{library:[savedBlog, ...saves]}})
                      setSavedBlogs([savedBlog, ...saves])
                      setHasSaved(true);
    
                  }
    
            }else{
                const savedBlog = {blogID:postID, added:new Date()}
                await updateData({collectionName:'users', Id:userID, data:{library:[savedBlog]}})
                setSavedBlogs([savedBlog])
                setHasSaved(true);
            }
        }
    
      } catch (error) {
        setError(error.message);
        console.log(error);
        error.message != "EMPTY_LIBRARY" && toast.error("There was some Error!")
      } finally {
        setStat(false);
      }
  }


  return {
    stat, hasSaved, error, savedBlogs, saveBlog
  }
};
