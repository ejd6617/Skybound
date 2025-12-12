import { collection, deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { TravelerType } from "./types/travelers";

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
          LastLogIn: serverTimestamp(),
          subscriptionTier: "free",
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
    LastLogIn: any;
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
        LastLogIn: docSnap.data().LastLogIn,
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

  //TravelerDetails structure
  interface TravelerDetails {
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    Birthday: string;
    Gender: string;
    Type: TravelerType;
    Nationality?: string;
    PassportNumber?: string;
    PassportExpiration?: string;
  }
  
  //CRUD operations for Traveler details subcollection
  const setTravelerDetails = async (
    userID: string,
    traveler: TravelerDetails
  ): Promise<string | null> => {
    try {
      if (!userID) throw new Error("Invalid userID provided");

      const docRef = collection(
        doc(db, "Users", userID), "TravelerDetails"
      );

      const newTravelerRef = doc(docRef);

      await setDoc(newTravelerRef, {
        ...traveler,
        DateAdded: serverTimestamp(),
      });

      return newTravelerRef.id;
    } catch (error) {
      console.error("Error adding traveler details:", error);
      return null;
    }
  };

  const getTravelerDetails = async (
    userID: string,
    travelerID: string
  ): Promise<{
    Type: TravelerType;
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    Birthday: string;
    Gender: string;
    Nationality: string;
    PassportNumber: string;
    PassportExpiration: string;
    DateAdded: any;
  } | null> => {
    try {
      if (!userID) throw new Error("Invalid userID provided");
      if (!travelerID) throw new Error("Invalid travelerID provided");
  
      const docRef = doc(db, "Users", userID, "TravelerDetails", travelerID);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
  
      return {
        FirstName: data.FirstName,
        MiddleName: data.MiddleName,
        LastName: data.LastName,
        Birthday: data.Birthday,
        Gender: data.Gender,
        Nationality: data.Nationality,
        PassportNumber: data.PassportNumber,
        PassportExpiration: data.PassportExpiration,
        DateAdded: data.DateAdded,
        Type: data.Type,
      };
    } catch (error) {
      console.error("Error fetching traveler: ", error);
      return null;
    }
  };

  const updateTravelerDetails = async (
    userID: string,
    travelerID: string,
    data: Record<string, any>
  ): Promise<boolean> => {
    try {
      if (!userID || typeof userID !== "string") {
        throw new Error("Invalid userID provided");
      }
  
      if (!travelerID || typeof travelerID !== "string") {
        throw new Error("Invalid travelerID provided");
      }
  
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data object provided");
      }
  
      const docRef = doc(db, "Users", userID, "TravelerDetails", travelerID);
      await updateDoc(docRef, data);
  
      return true;
    } catch (error) {
      console.error("Error updating traveler: ", error);
      return false;
    }
  };

  const deleteTravelerDetails = async (userID: string, travelerID: string): Promise<boolean> => {
    try {
      if (!userID) throw new Error("Invalid userID provided");
      if (!travelerID) throw new Error("Invalid travelerID provided");
  
      const docRef = doc(db, "Users", userID, "TravelerDetails", travelerID);
      await deleteDoc(docRef);
  
      return true;
    } catch (error) {
      console.error("Error deleting traveler: ", error);
      return false;
    }
  };

export { deleteTravelerDetails, deleteUserData, getTravelerDetails, getUserData, setTravelerDetails, setUserData, updateTravelerDetails, updateUserData };

