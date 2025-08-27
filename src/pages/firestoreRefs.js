// firestoreRefs.js
import { doc, collection } from 'firebase/firestore';
import { db } from '../firebase-config'; // Ensure this path is correct
import * as paths from '../firestorePaths'; // Ensure this path is correct

// Classes
export const classDocRef = (className) =>
  doc(db, paths.getClassDoc(className));

export const studentDocRef = (className, studentId) =>
  doc(db, paths.getStudentDoc(className, studentId));

// UID to Student ID mapping
export const uidToStudentIdRef = (uid) =>
  doc(db, 'uid_to_student_id', uid);

export const studentsColRef = (className) =>
  collection(db, paths.getStudentsCollection(className));

export const keyDocRef = (className, key) =>
  doc(db, paths.getKeyDoc(className, key));

// User references
export const userDocRef = (uid) =>
  doc(db, paths.getUserDoc(uid));

export const starredFriendsColRef = (uid) =>
  collection(db, paths.getStarredFriendsCollection(uid));

export const pointsHistoryColRef = (uid) =>
  collection(db, paths.getPointsHistoryCollection(uid));