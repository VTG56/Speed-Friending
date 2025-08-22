// firestoreRefs.js
import { doc, collection } from 'firebase/firestore';
import { db } from '../firebase';   // adjust path if needed
import * as paths from '../firestorePaths';

// Classes
export const classDocRef = (className) =>
  doc(db, paths.getClassDoc(className));

export const studentDocRef = (className, studentId) =>
  doc(db, paths.getStudentDoc(className, studentId));

export const studentsColRef = (className) =>
  collection(db, paths.getStudentsCollection(className));

export const keyDocRef = (className, key) =>
  doc(db, paths.getKeyDoc(className, key));

// Users
export const userDocRef = (uid) =>
  doc(db, paths.getUserDoc(uid));

export const starredFriendsColRef = (uid) =>
  collection(db, paths.getStarredFriendsCollection(uid));

export const pointsHistoryColRef = (uid) =>
  collection(db, paths.getPointsHistoryCollection(uid));
