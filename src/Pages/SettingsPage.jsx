import React, { useEffect, useState } from "react";
import { checkUser, checkUsername } from "../Hooks/AuthValidation";
import Loading from "../UI/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authAction, uiAction } from "../Store/Store";
import { FaTimes } from "react-icons/fa";
import DialogModal from "../Components/DialogModal";
import { readData, updateData } from "../Firebasem/FirestoreF";
import { toast } from "react-toastify";
import ProfilePage from "./ProfilePage";
import profilepic from "../assets/profilepic.png";
import { FileInput } from "../UI/FormElements";
import FormValidate from "../Hooks/FormValidate";
import FileUpload from "../Firebasem/Storage";

function SettingsPage() {
  const param = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const username = param.username;

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUsername = useSelector(
    (state) => state.auth.currentUserData.username
  );
  const currentUserEmail = useSelector(
    (state) => state.auth.currentUserData.email
  );

  const notUserFn = () => {
    navigate("/");
  };

  const { userloading, error, isCurrentUser, paramUserId, isLoggedIn } =
    checkUser({
      username: username,
      dependency: [param, currentUser],
      notUserFn: notUserFn,
    });

  const [usernameChange, setUsernameChange] = useState(false);
  const [profileChange, setProfileChange] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      {userloading && <Loading />}
      {!userloading && isCurrentUser && (
        <>
          <div className="wrapper px-5 flex justify-center relative text-slate-700">
            <div className="py-4 w-full md:w-[60%]">
              <p className="sm:block font-bold text-4xl mt-6 mb-10">Settings</p>

              <div className="py-6 flex flex-col gap-6">
                <div className="flex justify-between gap-4">
                  <p>Email address</p>
                  <p className="text-[0.85rem]">{currentUserEmail}</p>
                </div>
                <div
                  className="flex justify-between gap-4 cursor-pointer"
                  onClick={() => {
                    setUsernameChange(true);
                  }}
                >
                  <p>Username</p>
                  <p className="text-[0.85rem]">{currentUsername}</p>
                </div>
                <DialogModal
                  isOpen={usernameChange}
                  onClose={() => {
                    setUsernameChange(false);
                  }}
                  type="modal"
                  disabled={submitting}
                >
                  <EditUsername
                    username={username}
                    openCont={setUsernameChange}
                    onSetSubmitting = {setSubmitting}
                  />
                </DialogModal>
                <div
                  className="flex justify-between gap-4 cursor-pointer"
                  onClick={() => {
                    setProfileChange(true);
                  }}
                >
                  <p>Profile information</p>
                  <p className="text-[0.85rem]">Edit name, photo etc</p>
                </div>
                <DialogModal
                  isOpen={profileChange}
                  onClose={() => {
                    setProfileChange(false);
                  }}
                  type="modal"
                  disabled={submitting}
                >
                  <EditProfile openCont={setProfileChange} onSetSubmitting = {setSubmitting}/>
                </DialogModal>
                <div className="flex justify-between gap-4 cursor-pointer">
                  <p>Blocked Users </p>
                </div>
                <div className="flex justify-between gap-4 cursor-pointer">
                  <p className="text-red-500">Deactivate Account</p>
                  <p className="text-[0.85rem]">
                    Disable Account until you sign back in.
                  </p>
                </div>
                <div className="flex justify-between gap-4 cursor-pointer">
                  <p className="text-red-500">Delete Account</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsPage;

const EditUsername = ({ username, openCont, onSetSubmitting }) => {
  const navigate = useNavigate();
  const { loading, exist, checkFn } = checkUsername();

  const dispatch = useDispatch();
  const INITIAL_USERNAME = username;
  const INITIAL_USERNAME_NO_AT = username.slice(username.indexOf("@") + 1);

  const [usernameInp, setUserNameInp] = useState({
    value: INITIAL_USERNAME_NO_AT,
    valid: null,
    errorMsg: "",
  });

  const inputHandler = (e) => {
    const sanitizedValue = e.target.value.replace(/@/g, "");
    setUserNameInp((prevValue) => ({
      ...prevValue,
      value: sanitizedValue,
    }));

    validHandler(sanitizedValue);
  };

  const validHandler = (value = null) => {
    if (value == null) {
      value = usernameInp.value;
    }

    //sameValue
    if (value == INITIAL_USERNAME_NO_AT) {
      setUserNameInp((prevValue) => ({
        ...prevValue,
        valid: false,
        errorMsg: "",
      }));
      return false;
    }

    //invalid cxc
    else if (/[^a-zA-Z0-9._]/.test(value)) {
      setUserNameInp((prevValue) => ({
        ...prevValue,
        valid: false,
        errorMsg: 'Username may only use letters, numbers, ".", and "_"!',
      }));
      return false;
    }

    //length
    else if (value.length < 3 || value.length > 20) {
      setUserNameInp((prevValue) => ({
        ...prevValue,
        valid: false,
        errorMsg: "Length should be in specified range!",
      }));
      return false;
    } else {
      setUserNameInp((prevValue) => ({
        ...prevValue,
        valid: true,
        errorMsg: "",
      }));
    }

    //existence
    checkFn("@" + value);
  };

  const [formSubmitting, setFormSubmitting] = useState(false);
  const currentUser = useSelector((state) => state.auth.currentUser);

  const formHandler = async (e) => {
    setFormSubmitting(true);
    onSetSubmitting(true)
    e.preventDefault();
    validHandler();
    if (usernameInp.valid && exist !== "YES" && !loading) {
      const newUsername = "@" + usernameInp.value;
      try {
        const existence = await checkFn(newUsername);
        // we have done it above but i.e just for the UI we should make sure database updated properly

        if (!existence) {
          const upadteUName = await updateData({
            collectionName: "users",
            Id: currentUser,
            data: {
              username: newUsername,
            },
          });
          const userData = await readData({
            collectionName: "users",
            Id: currentUser,
          });
          toast.success("Username Updated successfully!");
          dispatch(authAction.setCurrentUserData(userData.data()));
          navigate(`/${newUsername}/settings`, { replace: true });
          openCont(false);
        }

        console.log(existence);
      } catch (error) {
        console.log(error);
        toast.error("There was some Error");
      }
    }
    setFormSubmitting(false);
    onSetSubmitting(false)
  };

  return (
    <>
      <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]  z-[500] bg-white shadow-xl p-8 w-full h-full  sm:w-[600px] sm:h-fit">
        <button
          onClick={formSubmitting ? null :() => {
            openCont(false);
          }}
          className="absolute right-1 top-1 p-2 text-xl"
        >
          <FaTimes />
        </button>
        <form action="" onSubmit={formHandler}>
          <div className="flex flex-col gap-2">
            <p>Username</p>
            <div className=" bg-slate-100 relative text-[0.85rem]">
              <input
                type="text"
                className=" w-full bg-transparent outline-none p-2 pl-7 rounded-sm"
                value={usernameInp.value}
                onChange={(e) => {
                  inputHandler(e);
                }}
                name="username"
              />
              <span className="absolute left-4 top-[50%] translate-y-[-50%] flex items-center">
                @
              </span>
            </div>
            <div className="flex justify-between gap-4 text-[0.85rem]">
              <p className="">
                {usernameInp.errorMsg && (
                  <span className="text-red-500">{usernameInp.errorMsg}</span>
                )}
                {loading && "checking Username..."}
                {!loading && exist == "YES" && (
                  <span className="text-red-500">Username Already Exist!</span>
                )}
              </p>
              <p
                className={`${
                  usernameInp.errorMsg == "Length should be in specified range!"
                    ? "text-red-500"
                    : "text-inherit"
                }`}
              >
                3-20
              </p>
            </div>
            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={() => {
                  openCont(false);
                }}
                className="mediumBtn !px-4 !border !border-green-500 !text-green-500 !bg-transparent"
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={
                  loading ||
                  exist == "YES" ||
                  !usernameInp.valid ||
                  formSubmitting
                }
                className="mediumBtn !px-4 !bg-green-500 !text-white disabled:opacity-70"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

const EditProfile = ({ openCont, onSetSubmitting }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.currentUser);
  const currentUsername = useSelector(
    (state) => state.auth.currentUserData.username
  );

  const [name, setName] = useState({ initial: "", value: "", valid: null });
  const [profileUrl, setProfileUrl] = useState({
    initial: "",
    value: null,
    valid: null,
    currentValue: "",
  });
  const [bio, setBio] = useState({ initial: "", value: "", valid: null });

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const userDataa = await readData({
          collectionName: "users",
          Id: currentUser,
        });
        setName((prevValue) => ({
          ...prevValue,
          initial: userDataa.data().name,
          value: userDataa.data().name,
        }));

        if (userDataa.data().userImage) {
          setProfileUrl((prevValue) => ({
            ...prevValue,
            initial: userDataa.data().userImage,
            value: userDataa.data().userImage,
            currentValue: userDataa.data().userImage,
          }));
        }

        if (userDataa.data().bio) {
          setBio((prevValue) => ({
            ...prevValue,
            initial: userDataa.data().bio,
            value: userDataa.data().bio,
          }));
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserProfile();
  }, []);

  const { isBnLength, isEmpty, isMaxLength } = FormValidate();

  const inputHandler = (e) => {
    const { name, value } = e.target;

    if (name == "name") {
      setName((prevValue) => ({
        ...prevValue,
        value: value,
        valid: isBnLength(value, 3, 20),
      }));
    }

    if (name == "bio") {
      setBio((prevValue) => ({
        ...prevValue,
        value: value,
        valid: isBnLength(value, 0, 50, true),
      }));
    }
  };

  const fileHandler = (files) => {
    setProfileUrl((prevValue) => ({
      ...prevValue,
      valid: null,
    }));

    if (files) {
      const file = files[0];
      const validFileTypes = ["image/jpeg", "image/png", "image/gif"];

      if (validFileTypes.includes(file.type)) {
        const filePreview = URL.createObjectURL(file);

        setProfileUrl((prevValue) => ({
          ...prevValue,
          valid: false,
          value: file,
          currentValue: filePreview,
        }));
      } else {
        setProfileUrl((prevValue) => ({
          ...prevValue,
          valid: false,
        }));
      }
    }
  };

  const formHandler = (e) => {
    e.preventDefault();

    // if no change made
    if (
      name.initial == name.value &&
      bio.initial == bio.value &&
      profileUrl.initial == profileUrl.value
    ) {
      return false;
    }

    // if there are errors
    if (name.valid == false || bio.valid == false) {
      return false;
    }

    // setting which info needs update
    const fileUpdate =
      profileUrl.value && profileUrl.initial != profileUrl.value;
    const nameUpdate = name.initial != name.value;
    const bioUpdate = bio.initial != bio.value;

    submitForm({ fileUpdate, nameUpdate, bioUpdate });
  };

  const [submitting, setSubmitting] = useState(false);

  const submitForm = async ({ fileUpdate, nameUpdate, bioUpdate }) => {
    setSubmitting(true);
    onSetSubmitting(true)
    let error = false;
    const toastId = toast.loading("Updating Profile..");
    toast();
    try {
      if (nameUpdate) {
        const updateName = await updateData({
          collectionName: "users",
          Id: currentUser,
          data: { name: name.value },
        });
      }

      if (bioUpdate) {
        const updateBio = await updateData({
          collectionName: "users",
          Id: currentUser,
          data: { bio: bio.value },
        });
      }

      if (fileUpdate) {
        const uploadFile = await FileUpload({
          file: profileUrl.value,
          path: "ProfilePicture",
        });
        if (uploadFile) {
          const updateFile = await updateData({
            collectionName: "users",
            Id: currentUser,
            data: { userImage: uploadFile },
          });
        }
      }

      const userData = await readData({
        collectionName: "users",
        Id: currentUser,
      });
      dispatch(authAction.setCurrentUserData(userData.data()));
      navigate(`/${currentUsername}/settings`, { replace: true });
      openCont(false);

      toast.update(toastId, {
        render: "Profile Updated Successfully!",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "There was some Error!",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    } finally {
      setSubmitting(false);
      onSetSubmitting(false)
      console.log(error);
    }
  };

  
  const [deletePicDiag, setDeletePicDiag] = useState(false)

  const removePhoto = async() => {
    if (!profileUrl.currentValue) {
      return false;
    }

    if (profileUrl.currentValue == profileUrl.initial) {
      setDeletePicDiag(true)
    }else{
      setProfileUrl((prevValue) => ({
        ...prevValue,
        currentValue: prevValue.initial,
        value:prevValue.initial
      }));

    }
  };

  const deletePicture = async()=>{
    
    if (profileUrl.currentValue == profileUrl.initial) {
      const toastId = toast.loading("Deleting Picture...")
      try {
        setSubmitting(true)
        onSetSubmitting(true)
        await updateData({collectionName:"users",Id:currentUser, data:{userImage:""}})
        
        const userData = await readData({
          collectionName: "users",
          Id: currentUser,
        });
        dispatch(authAction.setCurrentUserData(userData.data()));

        setProfileUrl((prevValue) => ({
          initial: "",
          value: null,
          valid: null,
          currentValue: "",
        }));

        toast.update(toastId, {
          render: "Profile Picture Deleted!",
          type: "success",
          isLoading: false,
          autoClose: true,
        });

      } catch (error) {
        console.log(error);
        toast.update(toastId, {
          render: "There was some Error!",
          type: "error",
          isLoading: false,
          autoClose: true,
        });
      }finally{
        setSubmitting(false)
        onSetSubmitting(false)
      }

      
    }
  }

  return (
    <>
      <div
        className={`fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[500]  bg-white shadow-xl p-8 w-full h-full  sm:w-[600px] sm:h-fit`}
      >
        <button
          onClick={submitting ? null : () => {
            openCont(false);
          }}
          className="absolute right-1 top-1 p-2 text-xl"
        >
          <FaTimes />
        </button>
        <form action="" onSubmit={formHandler}>
          <div className="flex flex-col gap-6">
            <p className="text-xl font-bold text-center mb-6 text-slate-900">
              Profile Information
            </p>
            <div className="flex gap-6 text-[0.85rem]">
              <FileInput onSetFile={fileHandler}>
                <div className="w-[80px] h-[80px]">
                  <img
                    src={
                      profileUrl.currentValue
                        ? profileUrl.currentValue
                        : profilepic
                    }
                    className="w-full h-full rounded-[50%] object-center object-cover border"
                    alt=""
                  />
                </div>
              </FileInput>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <FileInput onSetFile={fileHandler}>
                    <button
                      type="button"
                      className="text-green-500 cursor-pointer"
                    >
                      Update
                    </button>
                  </FileInput>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={removePhoto}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
                <p>
                  Recommended: Square JPG, PNG, or GIF, at least 1,000 pixels
                  per side.
                </p>
              </div>
              <DialogModal isOpen={deletePicDiag} title="Delete Your Profile Picture?" type={"confirm"} onConfirm={()=>{deletePicture()}} onClose={()=>{setDeletePicDiag(false) }} disabled={submitting}/>
            </div>
            <div className=" flex flex-col gap-2">
              <p className="text-inherit">Name</p>
              <div className=" bg-slate-100 relative text-[0.85rem]">
                <input
                  type="text"
                  className=" w-full bg-transparent outline-none p-2 pl-4 rounded-sm"
                  value={name.value}
                  onChange={(e) => {
                    inputHandler(e);
                  }}
                  name="name"
                />
              </div>
              <div className="flex justify-between gap-4 text-[0.85rem]">
                <p className=""></p>
                <p
                  className={`${
                    name.valid == false ? "text-red-500" : "text-inherit"
                  }`}
                >
                  3-20
                </p>
              </div>
            </div>
            <div className=" flex flex-col gap-2">
              <p className="text-inherit">Bio</p>
              <div className=" bg-slate-100 relative text-[0.85rem]">
                <textarea
                  name="bio"
                  className=" w-full bg-transparent outline-none p-2 pl-4 rounded-sm h-20 resize-none"
                  id=""
                  value={bio.value}
                  onChange={(e) => {
                    inputHandler(e);
                  }}
                ></textarea>
              </div>
              <div className="flex justify-between gap-4 text-[0.85rem]">
                <p className=""></p>
                <p
                  className={`${
                    bio.valid == false ? "text-red-500" : "text-inherit"
                  }`}
                >
                  max 50
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-end mt-4">
              <button
                onClick={() => {
                  openCont(false);
                }}
                disabled={submitting}
                className="mediumBtn !px-4 !border !border-green-500 !text-green-500 !bg-transparent"
                type="button"
              >
                Cancel
              </button>
              <button
                disabled={
                  submitting ||
                  bio.valid == false ||
                  name.valid == false ||
                  (name.initial == name.value &&
                    bio.initial == bio.value &&
                    profileUrl.initial == profileUrl.value)
                }
                className="mediumBtn !px-4 !bg-green-500 !text-white disabled:opacity-70"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
