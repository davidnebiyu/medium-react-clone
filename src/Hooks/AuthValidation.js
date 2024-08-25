import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../Firebasem/Store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { readData } from "../Firebasem/FirestoreF";

export const checkUser = ({username, dependency=[], notUserFn=null}) => {
    
    const navigate = useNavigate()

    const [userLoading, setUserLoading] = useState(true)
    const [error, setError] = useState(false);
    const [isCurrentUser, setIsCurrentUser] = useState(false)
    const [paramUserId, setParamUserId] = useState(null)
    const [isloggedIn, setIsloggedIn] = useState(false)
    const [userData, setUserData] = useState(null)


    useEffect(() => {
       
        const fetchUser = async()=>{

            try {
                setUserLoading(true);
        
              const userExRef = collection(db, "users");
              const userExQuery = query(
                userExRef,
                where("username", "==", `${username}`)
              );

              const userExSnapshot = await getDocs(userExQuery);
        
              if (userExSnapshot.empty) {
                navigate("/");
              } else {
                // check if user is current user
                const queryID = userExSnapshot.docs.map((data) => {
                  return data.id;
                });
        
                setParamUserId(queryID[0]);

                const Data = await readData({collectionName:"users", Id:queryID[0]})
                setUserData(Data.data())
        
                if (auth.currentUser) {
                  setIsloggedIn(true);
                  if (auth.currentUser.uid === queryID[0]) {
                    setIsCurrentUser(true);
                  } else {
                    notUserFn && notUserFn();  
                    setIsCurrentUser(false);
                  }
                } else {
                  setIsCurrentUser(false);
                  setIsloggedIn(false);
                }
        
                setUserLoading(false);
              }
            } catch (error) {
              console.log(error);
              setUserLoading(false);
              setError(error);
            }

        }

        fetchUser()


      },dependency);


    return {
        userLoading:userLoading, error:error, isCurrentUser:isCurrentUser, paramUserId:paramUserId, isloggedIn:isloggedIn, userData:userData
    }

  };

  export const checkUsername = ()=>{
    
    const [loading, setLoading] = useState(false)
    const [exist, setExist] = useState(null)

    const checkFn = async(username)=>{
      // const Username = "@"+username
      try {
        setLoading(true)


        const ref = collection(db, "users") 
        const queryRef = query(ref, where("username", "==", `${username}`))
        const querySnapshot = await getDocs(queryRef);
  
        if(querySnapshot.empty){
          setExist("NO")
        }else{
          setExist("YES")
        }
        return !querySnapshot.empty
  
      } catch (error) {
        setExist("error")
        console.log(error);
      }finally{
        setLoading(false)
      }
    }


    return {loading:loading, exist:exist, checkFn}

  }