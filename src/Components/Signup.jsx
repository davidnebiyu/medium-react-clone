import React, { useReducer, useState } from "react";
import Signin from "./Signin";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineEmail } from "react-icons/md";
import { uiAction } from "../Store/Store";
import { useDispatch } from "react-redux";
import { FaAngleLeft, FaTimes } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import FormValidate from "../Hooks/FormValidate";
import { toast } from "react-toastify";
import { signinGoogle, signout, signupEmail } from "../Firebasem/AuthF";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Firebasem/Store";
import { setData } from "../Firebasem/FirestoreF";
import { redirect } from "react-router-dom";

function Signup() {
  const dispatch = useDispatch();
  const [emailsignup, setEmailsignup] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const googleSignin = async () => {
    try {
      const signinUser = await signinGoogle();      

      const username = signinUser.user.email.slice(0, signinUser.user.email.lastIndexOf("@"))
      const ref = doc(db, "users", signinUser.user.uid);
      const userDoc = await getDoc(ref);

      if (!userDoc.exists()) {
        await setData({
          collectionName: "users",
          Id: signinUser.user.uid,
          data: {
            name: signinUser.user.displayName,
            email: signinUser.user.email,
            username:"@"+username,
            userImage: signinUser.user.photoURL,
          },
        });
      }

      redirect("/");
      dispatch(uiAction.removeModalElement());
    } catch (error) {
      console.log(error);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const initialValues = {
    values: {
      name: "",
      email: "",
      pass: "",
      passr: "",
    },
    validity: {
      name: false,
      email: false,
      pass: false,
      passr: false,
    },
    hasSubmit: false,
  };

  const formReduer = (prevValues, action) => {
    if (action.type == "input") {
      const { name, value } = action;

      return {
        ...prevValues,
        values: { ...prevValues.values, [name]: value },
      };
    }

    if (action.type == "validity") {
      const { name, value } = action;

      return {
        ...prevValues,
        validity: { ...prevValues.validity, [name]: value },
      };
    }

    if (action.type == "submit") {
      return { ...prevValues, hasSubmit: true };
    }

    if (action.type == "reset") {
      return { ...initialValues };
    }
  };

  const [formValues, dispatchForm] = useReducer(formReduer, initialValues);

  const validateInput = (e) => {
    const { name, value } = e.target;

    dispatchForm({ type: "input", name, value });
    validateValidity(e);
  };

  const { isEmpty, isValidEmail, isMinLength, hasSameValue } = FormValidate();

  const validateValidity = (e = null) => {
    let validity;
    if (e) {
      const { name, value } = e.target;
      if (name == "name") {
        validity = isMinLength(value, 3);
      }

      if (name == "email") {
        validity = isValidEmail(value);
      }

      if (name == "pass") {
        validity = isMinLength(value, 6);
      }

      if (name == "passr") {
        validity = hasSameValue(value, formValues.values.pass);
      }

      dispatchForm({ type: "validity", name: name, value: validity });
    } else {
      dispatchForm({
        type: "validity",
        name: "name",
        value: isMinLength(formValues.values.name, 3),
      });
      dispatchForm({
        type: "validity",
        name: "email",
        value: isValidEmail(formValues.values.email),
      });
      dispatchForm({
        type: "validity",
        name: "pass",
        value: isMinLength(formValues.values.pass, 6),
      });
      dispatchForm({
        type: "validity",
        name: "passr",
        value: hasSameValue(formValues.values.passr, formValues.values.pass),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatchForm({ type: "submit" });
    validateValidity();
    console.log(formValues);

    if (
      formValues.validity.name &&
      formValues.validity.email &&
      formValues.validity.pass &&
      formValues.validity.passr
    ) {
      submitForm();
    }
  };

  const submitForm = async () => {
    setSubmitting(true);
    const submitID = toast.loading("Submitting...");
    try {
      const signupUser = await signupEmail({
        email: formValues.values.email,
        password: formValues.values.pass,
      });

      if (signupUser.user) {
        const username = formValues.values.email.slice(0, formValues.values.email.lastIndexOf("@"))
        await signout(); // prevent firebase auto signing in upon signing up
        await setData({
          collectionName: "users",
          Id: signupUser.user.uid,
          data: {
            name: formValues.values.name,
            email: formValues.values.email,
            username:"@"+username
          },
        });
      }

      toast.update(submitID, {
        render: "Signing Up Success! ",
        type: "success",
        isLoading: false,
        autoClose: true,
      });

      dispatchForm({ type: "reset" });
    } catch (error) {
      if (error.message.indexOf("email-already-in-use") > -1) {
        toast.update(submitID, {
          render: "Email already Exist! ",
          type: "error",
          isLoading: false,
          autoClose: true,
        });
      } else {
        toast.update(submitID, {
          render: "There was some Error! ",
          type: "error",
          isLoading: false,
          autoClose: true,
        });
      }
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]  bg-white shadow-xl p-8 w-full h-full  sm:w-[600px] sm:h-fit">
        <button
          onClick={() => {
            dispatch(uiAction.removeModalElement());
          }}
          className="absolute right-1 top-1 p-2 text-xl"
        >
          <FaTimes />
        </button>

        {!emailsignup ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-title text-2xl mb-16 text-center">
              Join Medium.
            </p>
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={googleSignin}
                className="mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]"
              >
                {" "}
                <span className="text-xl">
                  <FcGoogle />
                </span>{" "}
                <span>Sign up with Google</span> <span></span>
              </button>
              <button
                onClick={() => {
                  setEmailsignup(true);
                }}
                className="mediumBtn flex justify-between items-center border !bg-transparent !text-inherit border-black1 !w-[300px]"
              >
                {" "}
                <span className="text-xl">
                  <MdOutlineEmail />
                </span>{" "}
                <span>Sign up with Email</span> <span></span>
              </button>
            </div>
            <p className="mt-[2rem]">
              Already have an account?{" "}
              <button
                onClick={() => {
                  dispatch(uiAction.setModalElement(Signin));
                }}
                className="text-green-700 hover:text-green-900"
              >
                Sign In
              </button>
            </p>
            <p className="text-center text-xs">
              Click “Sign In” to agree to Medium’s Terms of Service and
              acknowledge that Medium’s Privacy Policy applies to you.{" "}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="font-title text-2xl mb-16 text-center">
              Sign up with email
            </p>
            <form
              action=""
              className="flex flex-col items-center gap-4"
              onSubmit={handleSubmit}
            >
              <div className="">
                <p className="text-center">Your Name</p>
                <input
                  type="text"
                  value={formValues.values.name}
                  onChange={(e) => {
                    validateInput(e);
                  }}
                  name="name"
                  className="mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center"
                />
                {formValues.hasSubmit == true &&
                  formValues.validity.name == false && (
                    <p className="text-red-500">
                      Name Should be atleast 3 characters!
                    </p>
                  )}
              </div>
              <div className="">
                <p className="text-center">Your Email</p>
                <input
                  type="email"
                  value={formValues.values.email}
                  onChange={(e) => {
                    validateInput(e);
                  }}
                  name="email"
                  className="mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center"
                />
                {formValues.hasSubmit == true &&
                  formValues.validity.email == false && (
                    <p className="text-red-500">Email is not Valid!</p>
                  )}
              </div>
              <div className="">
                <p className="text-center">Your Password</p>
                <div className="pwdField">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    value={formValues.values.pass}
                    onChange={(e) => {
                      validateInput(e);
                    }}
                    name="pass"
                    className="mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center"
                  />
                  <button
                    onClick={() => {
                      setPasswordVisible(!passwordVisible);
                    }}
                    type="button"
                    className=""
                  >
                    {passwordVisible ? <IoMdEyeOff /> : <IoMdEye />}
                  </button>
                </div>
                {formValues.hasSubmit == true &&
                  formValues.validity.pass == false && (
                    <p className="text-red-500">
                      Password Should be atleast 3 characters!
                    </p>
                  )}
              </div>
              <div className="">
                <p className="text-center">Repeat Password</p>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={formValues.values.passr}
                  onChange={(e) => {
                    validateInput(e);
                  }}
                  name="passr"
                  className="mediumBtn !w-[300px] !bg-transparent !border border-black1 !text-black1 text-center"
                />
                {formValues.hasSubmit == true &&
                  formValues.validity.passr == false && (
                    <p className="text-red-500">Passwords do not match!</p>
                  )}
              </div>

              <button className="mediumBtn  !w-[250px]" disabled={submitting}>
                {" "}
                Continue
              </button>
            </form>
            <button
              onClick={() => {
                setEmailsignup(false);
              }}
              className="text-green-700 hover:text-green-900 flex items-center mt-[2rem]"
            >
              {" "}
              <FaAngleLeft className="text-xl" /> All sign up options
            </button>
            <p className="text-center text-xs">
              Click “Sign In” to agree to Medium’s Terms of Service and
              acknowledge that Medium’s Privacy Policy applies to you.{" "}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Signup;
