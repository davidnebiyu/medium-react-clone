import { db } from "./Store";
import {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
  getDoc,
  doc,
  getDocs,
} from "firebase/firestore";

// create or overwrite, when creating it need ID, if not exist it will create, if exist overwrite with the data if not said merge
export const setData = ({ collectionName, Id, data }) => {
  return setDoc(doc(db, collectionName, Id), { ...data });
};

// add data with firebase initiated id
export const addData = ({ collectionName, data }) => {
  return addDoc(collection(db, collectionName), { ...data });
};

// add data with subcollection
export const addDataSC = ({collectionName, subCollectionName, docId, data})=>{
  return addDoc(collection(db, collectionName, docId, subCollectionName), {...data})
}

// update document without overwriting
export const updateData = ({ collectionName, Id, data }) => {
  return updateDoc(doc(db, collectionName, Id), { ...data });
};

// update document without overwriting
export const updateDataSC = ({ collectionName, subCollectionName, docId, subCollId, data }) => {
  return updateDoc(doc(db, collectionName, docId, subCollectionName, subCollId), { ...data });
}; 

// incrementing a field data
export const incrementData = ({ collectionName, Id, fieldNamee, value }) => {
  return updateDoc(doc(db, collectionName, Id), {
    fieldNamee: increment(value),
  });
};

//delete data
export const deleteData = ({ collectionName, Id }) => {
  return deleteDoc(doc(db, collectionName, Id));
};

//delete data
export const deleteScData = ({ collectionName, docId, subCollName, subCollId }) => {
  return deleteDoc(doc(db, collectionName, docId, subCollName, subCollId));
};

// read single data
export const readData = ({ collectionName, Id }) => {
  return getDoc(doc(db, collectionName, Id));
};

// read subcollection data
export const readDataSC = ({ collectionName, subCollectionName, docId, subCollId }) => {
  return getDoc(doc(db, collectionName, docId, subCollectionName, subCollId));
};

// read all data in collection
const readDataAll = () => {
  const querySnapshot = getDocs(collection(db, "cities"));
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });
};

