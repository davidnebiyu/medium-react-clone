import { storage } from "./Store";
import { ref } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";

// This reference points to the root of your Cloud Storage bucket.
const storageRef = ref(storage)

// Create a child reference
// const imagesRef = ref(storage, 'images');
// imagesRef now points to 'images'

// Child references can also take paths delimited by '/'
// const spaceRef = ref(storage, 'images/space.jpg');
// spaceRef now points to "images/space.jpg"
// imagesRef still points to "images"


/*========================  UPLOADING  ============================================= */
// To upload a file to Cloud Storage, you first create a reference to the full path of the file, including the file name.
// const mountainImagesRef = ref(storage, 'images/mountains.jpg');

// Upload from a Blob or File
// uploadBytes() takes files via the JavaScript File and Blob APIs and uploads them to Cloud Storage.
// uploadBytes(mountainImagesRef, file).then((snapshot) => {
//     console.log('Uploaded a blob or file!');
//   });

//manage uploads
// const uploadTask = uploadBytesResumable(storageRef, file);
// Pause the upload
// uploadTask.pause();

// // Resume the upload
// uploadTask.resume();

// // Cancel the upload
// uploadTask.cancel();

// src/components/FileUpload.js
import React, { useState } from 'react';
import { uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { v4 as uuidv4 } from "uuid";

export async function FileUpload({file, path}) {
    
    const filename = `${file.name}-${uuidv4()}`;
    const imageRef = ref(storage, `${path}/${filename}` )
    const uploadTask = uploadBytesResumable(imageRef, file);
    
    return new Promise((resolve,reject)=>{
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
           
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log('Upload is running');
                break;
            }
        }, 
        (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            // switch (error.code) {
            // case 'storage/unauthorized':
            //     // User doesn't have permission to access the object
            //     break;
            // case 'storage/canceled':
            //     // User canceled the upload
            //     break;

            // // ...

            // case 'storage/unknown':
            //     // Unknown error occurred, inspect error.serverResponse
            //     break;
            // }
            reject(error);
        }, 
        () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL)
            }).catch(error => {
                reject(error);
              });
        }
        );
    })

}

export default FileUpload;