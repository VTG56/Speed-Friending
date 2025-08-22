// firestorePaths.js
export const getClassDoc = (className) => `classes/${className}`;
export const getStudentDoc = (className, studentId) => `classes/${className}/students/${studentId}`;
export const getStudentsCollection = (className) => `classes/${className}/students`;
export const getKeyDoc = (className, key) => `classes/${className}/keys/${key}`;
export const getUserDoc = (uid) => `users/${uid}`;
export const getStarredFriendsCollection = (uid) => `users/${uid}/starredFriends`;
export const getPointsHistoryCollection = (uid) => `users/${uid}/points_history`;
