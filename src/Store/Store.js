
import React from 'react'
import { createSlice, configureStore } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name:'Auth',
    initialState:{currentUser:null}
})

const uiSlice = createSlice({
    name:'UI',
    initialState:{backdropStat:false, modalElement:null},
    reducers:{
        setModalElement(state, action){
            state.backdropStat = true
            state.modalElement = action.payload
        },
        removeModalElement(state){
            state.backdropStat = false
            state.modalElement = null
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
            ignoredActions: ['UI/setModalElement'],
            ignoredPaths: ['ui.modalElement'],
          },
        }),
})

export default Store