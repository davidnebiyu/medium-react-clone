import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../Firebasem/Store";

import { IoIosMore } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { checkUser } from "../Hooks/AuthValidation";
import Loading from "../UI/Loading";

import moment from "moment/moment";
import DialogModal from "../Components/DialogModal";
import { deleteData } from "../Firebasem/FirestoreF";
import { toast } from "react-toastify";

function StoryPage() {
  const param = useParams();
  const navigate = useNavigate();

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

  const [section, setSection] = useState("DRAFTS");

  const [drafts, setDrafts] = useState({
    loading: false,
    count: null,
    value: [],
  });
  const [published, setPublished] = useState({
    loading: false,
    count: null,
    value: [],
  });

  const getDrafts = async () => {
    try {
      setDrafts((prevValues) => ({
        ...prevValues,
        loading: true,
      }));

      const draftRef = collection(db, "posts");
      const draftQuery = query(
        draftRef,
        where("blogger", "==", currentUser),
        where("status", "==", "DRAFT"),
        orderBy("timeStamp", "desc")
      );
      const draftSnap = await getDocs(draftQuery);

      if (!draftSnap.empty) {
        let draftRes = [];
        draftSnap.forEach((snap) => {
          let item = {
            id: snap.id,
            data: snap.data(),
          };
          draftRes.push(item);
        });

        setDrafts((prevValues) => ({
          ...prevValues,
          count: Number(draftSnap.size),
          value: draftRes,
        }));
      } else {
        setDrafts((prevValues) => ({
          ...prevValues,
          count: 0,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDrafts((prevValues) => ({
        ...prevValues,
        loading: false,
      }));
    }
  };

  const getPublished = async () => {
    try {
      setDrafts((prevValues) => ({
        ...prevValues,
        loading: true,
      }));

      const draftRef = collection(db, "posts");
      const draftQuery = query(
        draftRef,
        where("blogger", "==", currentUser),
        where("status", "==", "PUBLISHED"),
        orderBy("timeStamp", "desc")
      );
      const draftSnap = await getDocs(draftQuery);

      if (!draftSnap.empty) {
        let draftRes = [];
        draftSnap.forEach((snap) => {
          let item = {
            id: snap.id,
            data: snap.data(),
          };
          draftRes.push(item);
        });

        setPublished((prevValues) => ({
          ...prevValues,
          count: Number(draftSnap.size),
          value: draftRes,
        }));
      } else {
        setPublished((prevValues) => ({
          ...prevValues,
          count: 0,
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPublished((prevValues) => ({
        ...prevValues,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    if (section == "DRAFTS") {
      getDrafts();
    }
    if (section == "PUBLISHED") {
      getPublished();
    }
  }, [section]);


  const [activeDraftID, setActiveDraftID] = useState(null);

  const toggleDraftID = (id) => {
    setActiveDraftID(activeDraftID == id ? null : id);
  };

  return (
    <>
      {isCurrentUser == null && <Loading />}

      <div className="wrapper px-5 flex justify-center relative text-slate-700">
        <div className="py-4 w-full md:w-[60%]">
          <p className="sm:block font-bold text-4xl mt-6 mb-10">Stories</p>

          <div className="flex gap-6 border-b pb-4 mb-8 items-center relative overflow-x-auto no-scrollbar">
            <button
              className={`relative ${
                section == "DRAFTS"
                  ? "text-slate-900 after:absolute after:-bottom-4 after:border-b after:w-full after:left-0 after:h-1 after:border-b-slate-900 after:cursor-default"
                  : ""
              } text-[0.85rem] transition-all hover:text-slate-900 `}
              onClick={() => {
                setSection("DRAFTS");
              }}
            >
              Drafts {drafts.count && `(${drafts.count})`}
            </button>
            <button
              className={` relative ${
                section == "PUBLISHED"
                  ? "text-slate-900 after:absolute after:-bottom-4 after:border-b after:w-full after:left-0 after:h-1 after:border-b-slate-900 after:cursor-default"
                  : ""
              } text-[0.85rem] transition-all hover:text-slate-900 `}
              onClick={() => {
                setSection("PUBLISHED");
              }}
            >
              Published {published.count && `(${published.count})`}
            </button>
          </div>

          {section == "DRAFTS" && (
            <>
              {drafts.loading && <div className="loader small"></div>}

              {!drafts.loading && drafts.count == 0 && (
                <p className="font-bold">No Drafts Saved </p>
              )}

              {!drafts.loading &&
                drafts.count > 0 &&
                drafts.value.map((item) => (
                  <div
                    className="w-full py-4 flex flex-col gap-4 [&:not(:last-child)]:border-b border-slate-200"
                    key={item.id}
                  >
                    {
                      <p className="font-bold">
                        {" "}
                        <Link to={`/write?post=${item.id}&source=DRAFT`}>
                          {item.data.title ? item.data.title : "Untitled story"}
                        </Link>{" "}
                      </p>
                    }
                    <div className="flex justify-between text-[0.85rem] text-slate-700">
                      <p className="">
                        {item.data.initial ? "Created about" : "Last edited"}{" "}
                        {moment(
                          new Date(
                            `${
                              item.data.initial
                                ? item.data.timeStamp.seconds
                                : item.data.editTimeStamp.seconds
                            }` * 1000
                          )
                        ).from(new Date())}
                      </p>
                      <div className="relative">
                        <button
                          className=""
                          onClick={() => {
                            toggleDraftID(item.id);
                          }}
                        >
                          <IoIosMore className="text-xl" />
                        </button>
                        <DialogModal
                          isOpen={activeDraftID == item.id}
                          type="sidebar"
                          onClose={() => {
                            toggleDraftID(null);
                          }}
                        >
                          <ManageDraft
                            id={item.id}
                            source="DRAFT"
                            onSetDrafts={setDrafts}
                            openCont={toggleDraftID}
                          />
                        </DialogModal>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}

          {section == "PUBLISHED" && (
            <>
              {published.loading && <div className="loader small"></div>}

              {!published.loading && published.count == 0 && (
                <p className="font-bold">No Published Posts </p>
              )}

              {!published.loading &&
                published.count > 0 &&
                published.value.map((item) => (
                  <div
                    className="w-full py-4 flex flex-col gap-4 [&:not(:last-child)]:border-b border-slate-200"
                    key={item.id}
                  >
                    {
                      <p className="font-bold">
                        {" "}
                        <Link to={`/${currentUsername}/${item.id}`}>
                          {item.data.title ? item.data.title : "Untitled story"}
                        </Link>{" "}
                      </p>
                    }
                    <div className="flex justify-between text-[0.85rem] text-slate-700">
                      <p className="">
                        {item.data.initial ? "Created about" : "Last edited"}{" "}
                        {moment(
                          new Date(
                            `${
                              item.data.initial
                                ? item.data.timeStamp.seconds
                                : item.data.editTimeStamp.seconds
                            }` * 1000
                          )
                        ).from(new Date())}
                      </p>
                      <div className="relative">
                        <button
                          className=""
                          onClick={() => {
                            toggleDraftID(item.id);
                          }}
                        >
                          <IoIosMore className="text-xl" />
                        </button>
                        <DialogModal
                          isOpen={activeDraftID == item.id}
                          type="sidebar"
                          onClose={() => {
                            toggleDraftID(null);
                          }}
                        >
                          <ManageDraft
                            id={item.id}
                            source="PUBLISHED"
                            onSetDrafts={setPublished}
                            openCont={toggleDraftID}
                          />
                        </DialogModal>
                      </div>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

const ManageDraft = ({ id, openCont, onSetDrafts, source }) => {
  const handleDelete = async () => {
    try {
      await deleteData({ collectionName: "posts", Id: id });
      onSetDrafts((prevData) => ({
        ...prevData,
        count: prevData.count - 1,
        value: prevData.value.filter((item) => item.id != id),
      }));
      toast.success("Deleted a Post!");
    } catch (error) {
      console.log(error);
      toast.error("There was some Error!");
    } finally {
    }
  };

  const [deleteDisp, setDeleteDisp] = useState(false);

  return (
    <>
      <div className="bg-white absolute top-4 right-1 flex flex-col border items-start py-2 px-4 gap-2 text-slate-700 z-[500] ">
        <button className="hover:text-slate-950 w-fit text-nowrap py-1">
          {" "}
          <Link to={`/write?post=${id}&source=${source}`}>Edit Blog</Link>{" "}
        </button>
        <button
          className="text-red-500 hover:text-slate-950 w-fit text-nowrap py-1"
          onClick={() => {
            setDeleteDisp(true);
          }}
        >
          Delete Blog
        </button>
        <DialogModal
          isOpen={deleteDisp}
          title="Are you sure to Delete?"
          type={"confirm"}
          onConfirm={() => {
            handleDelete();
          }}
          onClose={() => {
            setDeleteDisp(false);
            openCont(null);
          }}
        />
      </div>
    </>
  );
};

export default StoryPage;
