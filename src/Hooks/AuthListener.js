import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import {auth} from '../Firebasem/Store' 
import { authAction } from '../Store/Store';
import { uiAction } from '../Store/Store';

function AuthListener() {
    const dispatch = useDispatch()

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        dispatch(uiAction.setAuthLoading(true));
          if (user) {
            dispatch(authAction.setCurrentUser(user));
          } else {
            dispatch(authAction.setCurrentUser(null));
          }
          dispatch(uiAction.setAuthLoading(false));
          console.log("AUTH CHECK RUNS", user);
        });
        
        return () => unsubscribe();
      }, []);
    
}

export default AuthListener