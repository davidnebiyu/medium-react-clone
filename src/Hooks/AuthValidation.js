import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../Firebasem/Store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { readData, updateData } from "../Firebasem/FirestoreF";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export const checkUser = ({ username, dependency = [], notUserFn = null }) => {
  // console.log(username);

  const navigate = useNavigate();

  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(null);
  const [paramUserId, setParamUserId] = useState(null);
  const [isloggedIn, setIsloggedIn] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);

        const userExRef = collection(db, "users");
        const userExQuery = query(
          userExRef,
          where("username", "==", `${username}`)
        );

        const userExSnapshot = await getDocs(userExQuery);

        if (userExSnapshot.empty) {
          navigate("/");
        } else {
          // check if user is current user
          const queryID = userExSnapshot.docs.map((data) => {
            return data.id;
          });

          setParamUserId(queryID[0]);

          const Data = await readData({
            collectionName: "users",
            Id: queryID[0],
          });
          setUserData(Data.data());

          if (auth.currentUser) {
            setIsloggedIn(true);
            if (auth.currentUser.uid === queryID[0]) {
              setIsCurrentUser(true);
            } else {
              notUserFn && notUserFn();
              setIsCurrentUser(false);
            }
          } else {
            setIsCurrentUser(false);
            setIsloggedIn(false);
          }

          setUserLoading(false);
        }
      } catch (error) {
        console.log(error);
        setUserLoading(false);
        setError(error);
      }
    };

    fetchUser();
  }, dependency);

  return {
    userLoading: userLoading,
    error: error,
    isCurrentUser: isCurrentUser,
    paramUserId: paramUserId,
    isloggedIn: isloggedIn,
    userData: userData,
  };
};

export const checkUsername = () => {
  const [loading, setLoading] = useState(false);
  const [exist, setExist] = useState(null);

  const checkFn = async (username) => {
    // const Username = "@"+username
    try {
      setLoading(true);

      const ref = collection(db, "users");
      const queryRef = query(ref, where("username", "==", `${username}`));
      const querySnapshot = await getDocs(queryRef);

      if (querySnapshot.empty) {
        setExist("NO");
      } else {
        setExist("YES");
      }
      return !querySnapshot.empty;
    } catch (error) {
      setExist("error");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading: loading, exist: exist, checkFn };
};

export const checkFollowStat = () => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [stat, setStat] = useState(null);
  const [followerSize, setFrSize] = useState(null);
  const [followingSize, setFwSize] = useState(null);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const param = useParams();
  const username = param.username;

  const currentUser = useSelector((state) => state.auth.currentUser);

  const currentUserData = useSelector((state) =>
    state.auth.currentUserData ? state.auth.currentUserData : null
  );

  const currentUsername = useSelector((state) =>
    state.auth.currentUserData ? state.auth.currentUserData.username : null
  );

  const checkStat = async ({
    user1ID,
    user2ID,
    getFollowers = false,
    getFollowings = false,
    toggle = false,
    onSyncFollowers,
    onSyncFollowing,
    onSyncFollowingSize,
  }) => {
    setLoading(true);
    setError(null);
    if (!user1ID) {
      return;
    }
    try {
      const user1Data = await readData({
        collectionName: "users",
        Id: user1ID,
      });
      const user2Data = user2ID
        ? await readData({ collectionName: "users", Id: user2ID })
        : null;

      const user1Followings = user1Data.data().following;
      const user1Followers = user1Data.data().followers;

        if (!user1Followers || !user1Followers.length > 0) {
          setFrSize(0);
        } else {
            setFrSize(user1Followers.length);
        }
      

        if (!user1Followings || !user1Followings.length > 0) {
          setFwSize(0);
        } else {
          setFwSize(user1Followings.length);
        }


      if (getFollowers) {
        if (!user1Followers || !user1Followers.length > 0) {
          setStat(false);
          throw new Error("NO_FOLLOWERS_FOUND");
        } else {
          let followersData = user1Followers.map(async (follower) => {
            const data = await readData({
              collectionName: "users",
              Id: follower,
            });
            return { id: data.id, info: data.data() };
          });

          const followersData2 = await Promise.all(followersData);

          setFollowers(followersData2);
        }
      }

      if (getFollowings) {
        if (!user1Followings || !user1Followings.length > 0) {
          setStat(false);
          throw new Error("NO_FOLLOWING_FOUND");
        } else {
          let followingData = user1Followings.map(async (following) => {
            const data = await readData({
              collectionName: "users",
              Id: following,
            });
            return { id: data.id, info: data.data() };
          });

          const followingData2 = await Promise.all(followingData);

          setFollowing(followingData2);
        }
      }

      if (user1Followings && user1Followings.includes(user2ID)) {
        setStat(true);
      } else {
        setStat(false);
      }

      if (toggle) {

        if (user1Followings && user1Followings.includes(user2ID)) {
          let newFollowings =
            user1Followings.length == 1
              ? []
              : user1Followings.filter(
                  (pervFollowings) => pervFollowings != user2ID
                );

          let user2Followers = user2Data.data().followers;
          let newUser2Followers =
            user2Followers.length == 1
              ? []
              : user2Followers.filter(
                  (prevFollowers) => prevFollowers != user1ID
                );

          await updateData({
            collectionName: "users",
            Id: user1Data.id,
            data: { following: [...newFollowings] },
          });
          await updateData({
            collectionName: "users",
            Id: user2Data.id,
            data: { followers: [...newUser2Followers] },
          });

          if (username == currentUsername) {
            if (onSyncFollowing) {
              onSyncFollowing((prevData) =>
                prevData.filter((data) => data.id != user2ID)
              );
            }
          } else {
            if (onSyncFollowers) {
              onSyncFollowers((prevData) =>
                prevData.filter((data) => data.id != user1ID)
              );
            }
          }

          setStat(false);
          onSyncFollowingSize && onSyncFollowingSize(user1Followings.length - 1)
        } else {
          let newFollowings =
            !user1Followings || !user1Followings.length > 0
              ? [user2ID]
              : [user2ID, ...user1Followings];

          let newUser2Followers =
            !user2Data.data().followers ||
            !user2Data.data().followers.length > 0
              ? [user1ID]
              : [user1ID, ...user2Data.data().followers];

          await updateData({
            collectionName: "users",
            Id: user1Data.id,
            data: { following: [...newFollowings] },
          });
          await updateData({
            collectionName: "users",
            Id: user2Data.id,
            data: { followers: [...newUser2Followers] },
          });

          if (username == currentUsername) {
            if (onSyncFollowing) {
              const data = await readData({
                collectionName: "users",
                Id: user2ID,
              });

              const newFollowingData = { id: data.id, info: data.data() };

              onSyncFollowing((prevData) => [newFollowingData, ...prevData]);
            }
          } else {
            if (onSyncFollowers) {
              const newFollowerData = {
                id: currentUser,
                info: currentUserData,
              };

              onSyncFollowers((prevData) => [newFollowerData, ...prevData]);
            }
          }
          
          onSyncFollowingSize && onSyncFollowingSize(user1Followings.length + 1)
          setStat(true);
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message)(
        error.message != "NO_FOLLOWERS_FOUND" ||
          error.message != "NO_FOLLOWING_FOUND"
      ) && toast.error("There was some Error");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    stat,
    followers,
    following,
    followerSize,
    followingSize,
    setFollowers,
    setFollowing,
    checkStat,
    setFwSize,
    setFrSize
  };
};
