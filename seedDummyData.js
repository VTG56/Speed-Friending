/**
 * seedDummyTest.js
 * -----------------------------------------------------
 * What it does:
 * 1) Ensures DB structure exists for a specific CLASS_ID
 * 2) Seeds N students in /classes/{CLASS_ID}/students and /classes/{CLASS_ID}/keys
 * 3) Seeds /users/{uid} for each student
 * 4) Starts a real-time simulation of “key collection”:
 *    - pick a random player in that class
 *    - they enter another student's key (no duplicates)
 *    - +10 points, add points_history doc (id starts with a timestamp)
 *    - add to usedPasswords + occasionally star the friend
 *
 * Run:
 *   node seedDummyTest.js
 *
 * Requirements:
 *   - Add serviceAccountKey.json in the same folder (Firebase Admin key)
 *   - Node 18+
 *   - "type": "module" in package.json  (ESM). For CommonJS, see note at bottom.
 */

import admin from "firebase-admin";
import fs from "fs";

// ---------- CONFIG ----------
const SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json";
const CLASS_ID = "CS-C";            // 👈 change to the class you want to test
const NUM_STUDENTS = 35;            // how many dummy students to seed
const INTERVAL_MS = 7000;           // how often to simulate a key entry
const AWARD_POINTS = 10;            // +10 per valid key
const STAR_FRIEND_PROB = 0.6;       // 50% chance to star the friend when collecting a key

// ---------- INIT ----------
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ serviceAccountKey.json not found.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ---------- HELPERS ----------
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

function nowDocId(suffix = "") {
  // Your graph parses docId as: "<timestamp>_<whatever>"
  const ts = Date.now();
  return suffix ? `${ts}_${suffix}` : `${ts}_e`;
}


const CLUBS = [
  "Team Antariksh","Team Vyoma","Team Astra Robotics","CARV Hindi","Ashwa Racing",
  "Entrepreneurship Cell RVCE","Chimera Racing Electric","NSS National Service Scheme",
  "Coding Club RVCE","RV QuizCorp","Evoke","ACM RVCE","HAM CLUB RVCE","F/6.3 Photography Club",
  "CARV English","Rotaract Club of R.V.C.E","GDG RVCE","Alaap","Debating Society, RVCE",
  "Women in Cloud Insider Circle","dhRuVa","Team Helios Racing","TEAM KRUSHI","Team Frequency",
  "Project Garuda","Project Jatayu","TEDxRVCE","SPARK-IUCEE Student Chapter"
];

const STATES = [
  "NRI","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Jammu and Kashmir","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","New Delhi","Odisha","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

const HOBBIES = [
  "Singing", "Dancing", "Coding", "Cricket", "Football", "Photography", "Reading",
  "Chess", "Gaming", "Painting", "Writing", "Cycling", "Music", "Travel"
];

async function getNextUidIndex(classId) {
  // find how many students already exist
  const snap = await db.collection(`classes/${classId}/students`).get();
  return snap.size + 1; // next index after existing
}

function makeUid(classId, index) {
  const n = String(index).padStart(3, "0");
  return `dummy-${classId}-${n}`;
}

async function seedStudentsAndKeys(classId, count) {
  console.log(`\n📦 Seeding ${count} new students for class ${classId}...`);
  const studentsCol = db.collection(`classes/${classId}/students`);
  const keysCol = db.collection(`classes/${classId}/keys`);

  const created = [];

  // get starting index based on existing students
  let startIndex = await getNextUidIndex(classId);

  for (let i = 0; i < count; i++) {
    const uid = makeUid(classId, startIndex + i);
    const name = `Student ${startIndex + i}`;
    const state = sample(STATES);
    const club = sample(CLUBS);
    const hobby = sample(HOBBIES);
    const key = makeUid(name, state, club, hobby);

    // 1) student doc
    await studentsCol.doc(uid).set({
      uid,
      name,
      state,
      clubPreference: club,
      hobby,
      key,
      registrationDate: new Date().toISOString(),
      registrationTime: new Date().toLocaleString(),
    }, { merge: true });

    // 2) key doc
    await keysCol.doc(key).set({
      name,
      state,
      clubPreference: club,
      hobby,
      uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // 3) user doc
    await db.collection("users").doc(uid).set({
      name,
      classId: classId,
      points_total: 0,
      usedPasswords: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    created.push({ uid, name, key });
  }

  console.log(`✅ Added ${created.length} new students.`);
  return created;
}


async function loadClassRoster(classId) {
  const snap = await db.collection(`classes/${classId}/students`).get();
  const roster = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return roster;
}

async function getUserDoc(uid) {
  return db.collection("users").doc(uid);
}

async function getPlayerUsedKeys(uid) {
  const userRef = await getUserDoc(uid);
  const snap = await userRef.get();
  return snap.exists ? (snap.data().usedPasswords || []) : [];
}

// ---------- GAMEPLAY SIM ----------
/**
 * Simulate a real key entry:
 * - picker = random student in class
 * - target = another random student
 * - check duplicate via /users/{pickerUid}.usedPasswords
 * - write points_history doc & update points_total
 * - push key into usedPasswords
 * - optional star friend
 */
async function simulateOneKeyEntry(classId) {
  const roster = await loadClassRoster(classId);
  if (roster.length < 2) {
    console.log("Need at least 2 students to simulate.");
    return;
  }

  const picker = sample(roster);
  let target = sample(roster);
  // ensure different
  let guard = 0;
  while (target.uid === picker.uid && guard < 10) {
    target = sample(roster);
    guard++;
  }

  const pickerUid = picker.uid;
  const targetKey = target.key;

  // duplicate prevention
  const used = await getPlayerUsedKeys(pickerUid);
  if (used.includes(targetKey)) {
    // already used → skip
    console.log(`⏭️  ${picker.name} already used key of ${target.name}. Skipping.`);
    return;
  }

  // award points
  const pickerUserRef = await getUserDoc(pickerUid);
  const pickerUserSnap = await pickerUserRef.get();
  const currentTotal = pickerUserSnap.exists ? (pickerUserSnap.data().points_total || 0) : 0;
  const newTotal = currentTotal + AWARD_POINTS;

  // write points_history with ID that starts with timestamp (your graph expects this)
  const historyRef = pickerUserRef.collection("points_history")
                    .doc(nowDocId(target.uid)); // e.g., "1699999999999_dummy-...”
  await historyRef.set({
    points: newTotal,           // storing total at this moment
    points_total: newTotal,     // (keep both, your code reads either)
    delta: AWARD_POINTS,
    sourceKey: targetKey,
    targetUid: target.uid,
    classId: classId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // update user doc
  await pickerUserRef.set({
    points_total: newTotal,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    usedPasswords: FieldValue.arrayUnion(targetKey),
  }, { merge: true });

  // randomly star friend
  if (Math.random() < STAR_FRIEND_PROB) {
    await pickerUserRef.collection("starredFriends").add({
      friendName: target.name,
      friendKey: targetKey,
      state: target.state,
      clubPreference: target.clubPreference,
      hobby: target.hobby,
      classId: classId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log(`🏅 ${picker.name} collected ${target.name}'s key → +${AWARD_POINTS} (Total: ${newTotal})`);
}

// ---------- DRIVER ----------
async function main() {
    await seedStudentsAndKeys(CLASS_ID, NUM_STUDENTS);

  // 2) Kick off real-time simulation
  console.log(`\n🎮 Starting real-time key-entry simulation for class ${CLASS_ID}...`);
  console.log(`⏱️  Interval: ${INTERVAL_MS}ms, Award per key: +${AWARD_POINTS}, StarProb: ${STAR_FRIEND_PROB * 100}%\n`);

  setInterval(async () => {
    try {
      await simulateOneKeyEntry(CLASS_ID);
    } catch (e) {
      console.error("❌ simulateOneKeyEntry error:", e);
    }
  }, INTERVAL_MS);
}

main().catch((e) => {
  console.error("❌ Fatal:", e);
  process.exit(1);
});
