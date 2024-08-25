import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../Firebasem/Store";
import { authAction } from "../Store/Store";
import { uiAction } from "../Store/Store";
import { collection, query } from "firebase/firestore";
import { readData } from "../Firebasem/FirestoreF";

function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      dispatch(uiAction.setAuthLoading(true));
      if (user) {
        const userID = user.uid;

        try {
          const userExRef = await readData({
            collectionName: "users",
            Id: userID,
          });
          dispatch(authAction.setCurrentUserData(userExRef.data()));
        } catch (error) {
          console.log(error);
        }
        dispatch(authAction.setCurrentUser(userID));
      } else {
        dispatch(authAction.setCurrentUserData(null));
        dispatch(authAction.setCurrentUser(null));
      }
      dispatch(uiAction.setAuthLoading(false));
      console.log("AUTH CHECK RUNS", user);
    });

    return () => unsubscribe();
  }, []);
}

export default AuthListener;
