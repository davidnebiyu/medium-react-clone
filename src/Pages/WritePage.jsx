import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

import { collection, query, serverTimestamp, where } from "firebase/firestore";

import hljs from "highlight.js/lib/core";
import "highlight.js/styles/github.css";
import javascript from "highlight.js/lib/languages/javascript";
import DialogModal from "../Components/DialogModal";
import Loading from "../UI/Loading";
import Post from "../Components/Post";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { addData, readData, updateData } from "../Firebasem/FirestoreF";
import { FileInput } from "../UI/FormElements";
import FileUpload from "../Firebasem/Storage";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../Firebasem/Store";

import TagsInput from "react-tagsinput";
import 'react-tagsinput/react-tagsinput.css'


hljs.registerLanguage("javascript", javascript);

const QuillEditor = ({ getNote, initNote = "" }) => {
  const [note, setNote] = useState(initNote);

  useEffect(() => {
    getNote(note);
  }, [note]);

  useEffect(()=>{
    setNote(initNote)
  },[initNote])
  

  const editorRef = useRef(null);

  const [imageUploading, setImageUploading] = useState(false);

  const QuillImageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      setImageUploading(true);
      const file = input.files[0];
      const validFileTypes = ["image/jpeg", "image/png", "image/gif"];

      if (file && validFileTypes.includes(file.type)) {
        const url = await FileUpload({ file: file, path: "BlogPicture" });
        const range = editorRef.current.getEditor().getSelection();
        editorRef.current.getEditor().insertEmbed(range.index, "image", url);
      }
      setImageUploading(false);
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          // [{ color: [] }, { background: [] }],
          // [{ align: [] }],
          ["blockquote", "code-block"],
          // [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
          // [{ script: "sub" }, { script: "super" }],
          // [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
          ["link", "image", "video"],
          // ["clean"],
        ],
        handlers: {
          image: QuillImageHandler,
        },
      },
    }),
    []
  );

  return (
    <>
      <ReactQuill
        ref={editorRef}
        readOnly={imageUploading}
        theme="snow"
        value={note}
        onChange={setNote}
        modules={modules}
        formats={[
          "header",
          "font",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "ordered",
          "link",
          "image",
          "code-block",
          "video",
          "clean",
        ]}
        placeholder="Share your thoughts..."
        required
      />

      {imageUploading && <Loading transparent={true} size="small"></Loading>}
    </>
  );
};

function WritePage() {
  const [initNote, setInitNote] = useState("");
  const [note, setNote] = useState("");
  const [noteH, setNoteH] = useState("");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [initImg, setInitImg] = useState("")
  const [prevImg, setPrevImg] = useState("");
  const [currImg, setCurrImg] = useState("");
  
  const [preview, setPreview] = useState(false);

  const [status, setStatus] = useState("NEW");

  const [hasPosted, setHasPosted] = useState(false)

  const [tags, setTags] = useState([])

  const handletags = (value)=>{
    setTags(value)    
  }

  const postData = {title:title, content:noteH}

  const navigate = useNavigate();
  const currentUsername = useSelector(
    (state) => state.auth.currentUserData.username
  );

  const [checkStat, setCheckStat] = useState(true);

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const POST_ID = queryParams.get("post");
  const POST_SOURCE = queryParams.get("source");

  const checkPostAuth = async () => {

    try {
      // is post availiable
      const isPostRef = await readData({collectionName:"posts", Id:POST_ID})
      if(isPostRef.exists()){

        if(POST_SOURCE == isPostRef.data().status){
          setStatus(isPostRef.data().status)
        }else{
          navigate("/");
        }

        // is user the blogger
        if(currentUser != isPostRef.data().blogger){
          navigate("/");
        }

        setTitle(isPostRef.data().title)
        setDesc(isPostRef.data().desc)
        setInitNote(isPostRef.data().content)
        setCurrImg(isPostRef.data().prevImg)
        setInitImg(isPostRef.data().prevImg)
        setHasPosted(isPostRef.data().hasPosted)
        setTags(isPostRef.data().tags)

      }else{
        navigate("/")
      }    

    } catch (error) {
      console.log(error);
      
    }


  };

  useEffect(()=>{
    if(POST_ID){
      checkPostAuth()
    }

    setCheckStat(false)
  }, [])

  const getNote = (notee) => {
    setNote(notee);
  };

  const highlightCode = (content) => {
    const container = document.createElement("div");
    container.innerHTML = content;
    const codeBlocks = container.querySelectorAll("pre");
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block);
    });
    setNoteH(container.innerHTML);
  };

  useEffect(() => {
    highlightCode(note);
  }, [note]);

  const [submitting, setSubmitting] = useState(false);

  const currentUser = useSelector((state) => state.auth.currentUser);

  const saveDraft = async () => {
    if (title.trim() == "" && note.trim() == "") {
      toast.error("Please fill title or content");
      return false;
    }

    const toastID = toast.loading("Saving Blog...");
    try {
      setSubmitting(true);


      if (status == "NEW") {
        const draft = await addData({
          collectionName: "posts",
          data: {
            status: "DRAFT",
            title: title,
            desc: desc,
            content: note,
            blogger: currentUser,
            timeStamp: serverTimestamp(),
            initial: true,
            tags:tags
          },
        });

        const postID = draft.id;
        
        if (prevImg && postID) {
          const uploadFile = await FileUpload({
            file: prevImg,
            path: "BlogPicture",
          });
          if (uploadFile) {
            const updateFile = await updateData({
              collectionName: "posts",
              Id: postID,
              data: { prevImg: uploadFile },
            });
          }
        }

      }else{
        await updateData({
          collectionName: "posts",
          Id: POST_ID,
          data: {
            status: "DRAFT",
            title: title,
            desc: desc,
            content: note,
            editTimeStamp: serverTimestamp(),
            initial: false,
            tags:tags
          },
        });

        if (currImg != initImg) {
          if(prevImg){
              const uploadFile = await FileUpload({
                file: prevImg,
                path: "BlogPicture",
              });
              if (uploadFile) {
                const updateFile = await updateData({
                  collectionName: "posts",
                  Id: POST_ID,
                  data: { prevImg: uploadFile },
                });
              }
          }else{
            const deleteImg = await updateData({
              collectionName: "posts",
              Id: POST_ID,
              data: { prevImg: "" },
            });
          }
        }

      }


      navigate(`/${currentUsername}/stories`);

      toast.update(toastID, {
        render: "Blog Saved Successfully!",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
    } catch (error) {
      console.log(error);
      toast.update(toastID, {
        render: "There was some Error!",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const publishPost = async () => {
    if (title.trim() == "") {
      toast.error("Please fill title");
      return false;
    }

    if (note.trim() == "") {
      toast.error("Please fill the content");
      return false;
    }

    const toastID = toast.loading("Publishing Blog...");
    try {
      setSubmitting(true);


      if (status == "NEW") {
        const draft = await addData({
          collectionName: "posts",
          data: {
            status: "PUBLISHED",
            title: title,
            desc: desc,
            content: note,
            blogger: currentUser,
            timeStamp: serverTimestamp(),
            initial: true,
            likes:0,
            comments:0,
            hasPosted:true,
            tags:tags
          },
        });

        const postID = draft.id;
        
        if (prevImg && postID) {
          const uploadFile = await FileUpload({
            file: prevImg,
            path: "BlogPicture",
          });
          if (uploadFile) {
            const updateFile = await updateData({
              collectionName: "posts",
              Id: postID,
              data: { prevImg: uploadFile },
            });
          }
        }

        navigate(`/${currentUsername}/${postID}`);

      }else{
        await updateData({
          collectionName: "posts",
          Id: POST_ID,
          data: {
            status: "PUBLISHED",
            title: title,
            desc: desc,
            content: note,
            editTimeStamp: serverTimestamp(),
            initial: false,
            tags:tags
          },
        });

        if(!hasPosted){
          await updateData({
            collectionName: "posts",
            Id: POST_ID,
            data: {
              likes:0,
              comments:0,
              hasPosted:true,
            },
          });
        }

        if (currImg != initImg) {
          if(prevImg){
              const uploadFile = await FileUpload({
                file: prevImg,
                path: "BlogPicture",
              });
              if (uploadFile) {
                const updateFile = await updateData({
                  collectionName: "posts",
                  Id: POST_ID,
                  data: { prevImg: uploadFile },
                });
              }
          }else{
            const deleteImg = await updateData({
              collectionName: "posts",
              Id: POST_ID,
              data: { prevImg: "" },
            });
          }
        }

        navigate(`/${currentUsername}/${POST_ID}`);

      }

      toast.update(toastID, {
        render: "Blog Saved Successfully!",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
    } catch (error) {
      console.log(error);
      toast.update(toastID, {
        render: "There was some Error!",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    } finally {
      setSubmitting(false);
    }
  };


  const fileHandler = (files) => {
    if (files) {
      const file = files[0];
      const validFileTypes = ["image/jpeg", "image/png", "image/gif", "image/svg"];

      if (validFileTypes.includes(file.type)) {
        const filePreview = URL.createObjectURL(file);

        setPrevImg(file);
        setCurrImg(filePreview);
      }
    }
  };

  const removeImage = () => {
    setPrevImg("");
    setCurrImg("");
  };

  return (
    <>
      {checkStat ? (
        <Loading />
      ) : (
        <div className="blogWrapper">
          <div className="px-6 py-8 flex flex-col gap-6 relative">
            <div className="z-[10] w-full backdrop-blur-md flex justify-end gap-4 sticky top-[100px]">
              <button
                disabled={submitting}
                onClick={() => {
                  setPreview(true);
                }}
                className="mediumBtn sm:!px-6 !bg-white !text-inherit !border !border-black1 hover:!bg-black1 hover:!text-white transition-all"
              >
                Preview
              </button>
              <button
                disabled={submitting}
                onClick={saveDraft}
                className="mediumBtn sm:!px-6 hover:!bg-[#000000] transition-all"
              >
                Save as Draft
              </button>
              <button
                disabled={submitting}
                onClick={publishPost}
                className="mediumBtn sm:!px-6 !bg-green-600 hover:!bg-green-700 transition-all"
              >
                Publish
              </button>
            </div>

            <div className="flex gap-3 sm:gap-6 items-center">
              <FileInput onSetFile={fileHandler}>
                <div className="w-[40px] h-[40px] border">
                  {currImg && (
                    <img
                      src={currImg}
                      className="w-full h-full rounded-md object-center object-cover border transition-all duration-300 hover:scale-[2]"
                      alt=""
                    />
                  )}
                </div>
              </FileInput>

              <FileInput onSetFile={fileHandler}>
                {" "}
                <button disabled={submitting} className="text-nowrap">
                  {" "}
                  Set Preview Image
                </button>{" "}
              </FileInput>

              {!currImg && (
                <p className="text-[0.85rem] text-slate-700">No Image Chosen</p>
              )}
              {currImg && (
                <button
                  disabled={submitting}
                  className="!text-[0.85rem] !px-6 !bg-red-700 mediumBtn"
                  onClick={removeImage}
                >
                  Remove Picture
                </button>
              )}
            </div>

            <input
              type="text"
              name=""
              id=""
              value={title}
              className="border w-full bg-transparent outline-none p-2 rounded-sm"
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              placeholder="Title..."
            />
            <input
              type="text"
              name=""
              id=""
              value={desc}
              className="border w-full bg-transparent outline-none p-2 rounded-sm"
              onChange={(e) => {
                setDesc(e.target.value);
              }}
              placeholder="Description..."
            />

            <TagsInput className="border w-full bg-transparent outline-none p-2 py-1  rounded-sm" value={tags} onChange={handletags}/>

            <QuillEditor getNote={getNote} initNote={initNote} />
            <DialogModal
              isOpen={preview}
              onClose={() => {
                setPreview(false);
              }}
              type="modal"
            >
              <div className="fixed left-0 top-0 sm:left-auto sm:top-auto blogWrapper z-[500] bg-white shadow-xl pt-8 p-2 w-full max-h-[100vh]  overflow-y-auto sm:w-[630px] ">
                <button
                  onClick={() => {
                    setPreview(false);
                  }}
                  className="absolute right-1 top-1 p-2 text-xl"
                >
                  <FaTimes />
                </button>
                <Post postData={postData} preview={preview} />
              </div>
            </DialogModal>
          </div>
        </div>
      )}
    </>
  );
}

export default WritePage;
