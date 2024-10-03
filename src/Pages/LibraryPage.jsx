import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Link, useNavigate, useParams } from "react-router-dom";
import { checkUser } from "../Hooks/AuthValidation";
import Loading from "../UI/Loading";


import { deleteData, readData } from "../Firebasem/FirestoreF";

import { savePost } from '../Hooks/PostActions';
import Posts from "../Components/Posts";

function StoryPage() {
  const param = useParams();
  const navigate = useNavigate();

  const username = param.username;

  const currentUser = useSelector((state) => state.auth.currentUser);

  const notUserFn = () => {
    navigate("/");
  };

  const { userloading, error, isCurrentUser, paramUserId, isLoggedIn } =
    checkUser({
      username: username,
      dependency: [param, currentUser],
      notUserFn: notUserFn,
    });
  
  const {stat, error:saveError, hasSaved, savedBlogs, saveBlog} = savePost() 
  
  useEffect(()=>{
    saveBlog({userID:currentUser})
  }, [currentUser])
  

  return (
    <>
      {isCurrentUser == null && <Loading />}

      <div className="wrapper px-5 flex justify-center relative text-slate-700">
        <div className="py-4 w-full md:w-[60%]">
          <p className="sm:block font-bold text-4xl mt-6 mb-10">Saved Blogs</p>

            <>
              {stat && <div className="loader small"></div>}

              {!stat && savedBlogs.length == 0 && (
                <p className="font-bold">No Saved Blogs </p>
              )}

              {!stat &&
                savedBlogs.length > 0 &&
                
                savedBlogs.map((item) => (
                  <BlogLibrary blogID={item.blogID}/>
                ))}
            </>
        </div>
      </div>
    </>
  );
}


const BlogLibrary = ({blogID})=>{
    
  const [savedBlogData, setSavedBlogData] = useState(null)
  
  const getSavedBlogData = async()=>{
    
    try {
      const blog = await readData({collectionName:"posts", Id:blogID})

      const id = blog.id;
      const data = blog.data();
      
      setSavedBlogData({id:id, data:data}) 

    } catch (error) {
      console.log(error);      
    }finally{

    }

  }

  useEffect(()=>{
    getSavedBlogData()
  }, [])

  return (
    <>
      {
        savedBlogData &&
        
          <Posts post={savedBlogData.data} postID={savedBlogData.id} source="library"/>
      }

    </>
  )

}

export default StoryPage;
