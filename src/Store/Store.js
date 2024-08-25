
import React, { useEffect } from 'react'
import { createSlice, configureStore } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name:'Auth',
    initialState:{currentUser:null, currentUserData:null},
    reducers:{
        setCurrentUser(state, action){
            state.currentUser = action.payload;
        },
        setCurrentUserData(state, action){
            state.currentUserData = action.payload;
        }
    }
})

const uiSlice = createSlice({
    name:'UI',
    initialState:{backdropStat:false, modalElement:null, authLoading:true},
    reducers:{
        setModalElement(state, action){
            state.modalElement = action.payload
        },
        removeModalElement(state){
            state.modalElement = null
        },
        setAuthLoading(state,action){
            state.authLoading = action.payload
        }
    }
})

export const authAction = authSlice.actions
export const uiAction = uiSlice.actions;

const Store = configureStore({
    reducer:{
        auth:authSlice.reducer,
        ui:uiSlice.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            // Ignore specific action types and paths
            ignoredActions: ['UI/setModalElement', 'Auth/setCurrentUser'],
            ignoredPaths: ['ui.modalElement', 'auth.currentUser'],
          },
        }),
})

export default Store