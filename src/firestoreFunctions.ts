import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

//basic CRUD operations for the user data in our Firestore db
const setUserData = async (userID: string, name: string, email: string): Promise<boolean> => {
    try {
      if (!userID || typeof userID !== "string") {
        throw new Error("Invalid userID provided");
      }
      if (!name || typeof name !== "string") {
        throw new Error("Invalid name provided");
      }
      if (!email || typeof email !== "string") {
        throw new Error("Invalid email provided");
      }

      const docRef = doc(db, "Users", userID);
      await setDoc(
        docRef,
        {
          Name: name,
          Email: email,
          UserID: userID,
          DateCreated: serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    } catch (error) {
      console.error("Error creating user: ", error);
      return false;
    }
  };
  
    const getUserData = async (userID: string): Promise<{
    Name: string;
    Email: string;
    UserID: string;
    DateCreated: any;
  } | null> => {
    try {
      if (!userID) throw new Error("Invalid userID provided");
  
      const docRef = doc(db, "Users", userID);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
  
      return {
        Name: docSnap.data().Name,
        Email: docSnap.data().Email,
        UserID: docSnap.data().UserID,
        DateCreated: docSnap.data().DateCreated,
      };
    } catch (error) {
      console.error("Error fetching user: ", error);
      return null;
    }
  };
  
  const updateUserData = async (userID: string, data: Record<string, any>): Promise<boolean> => {
    try {
      if (!userID || typeof userID !== "string") {
        throw new Error("Invalid userID provided");
      }
  
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data object provided");
      }
  
      const docRef = doc(db, "Users", userID);
      await updateDoc(docRef, data);

      return true;
    } catch (error) {
      console.error("Error updating user: ", error);
      return false;
    }
  };
  
  const deleteUserData = async (userID: string): Promise<boolean> => {
    try {
      if (!userID) throw new Error("Invalid userID provided");
  
      const docRef = doc(db, "Users", userID);
      await deleteDoc(docRef);
  
      return true;
    } catch (error) {
      console.error("Error deleting user: ", error);
      return false;
    }
  };

export { deleteUserData, getUserData, setUserData, updateUserData };
