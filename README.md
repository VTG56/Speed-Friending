# SpeedFriending 🤝✨

## Project History

The initial development and core framework were established by the team, with valuable contributions from **shash-2106** as a key collaborator. You can view their commit history [here](https://github.com/shash-2106/SpeedFriending/commits?author=shash-2106).

---

SpeedFriending is an interactive, gamified networking web app designed for college events. It encourages students to connect with their classmates in a fun and competitive way. Players register, receive a unique key, and collect keys from other students in their class to climb the leaderboard.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://student-registration-app-67741.web.app)

---

## Core Flow 🚀

The application is divided into two main phases: **Registration** and the **Main Game**.

### 1. Registration Phase 📝

New players start by registering their profile.

* **Enter Details**: Students provide their Name, Hobby, Club Preference, Native Place, and Classroom.
* **Generate Key**: The system creates a unique key for the student in the format: `Name+Native+ClubPreference+Hobby`.
* **Enter Arena**: After successful registration, students are directed to a "Thank You" page with a button to enter the main game arena.

### 2. Main Game Phase 🏆

The Arena is the central hub of the application and includes three primary features:

#### (a) Real-Time Leaderboard 📊

* Displays a live leaderboard for the player's specific class.
* Rankings are based on points, with data pulled from Firestore in real-time.
* Players can track their standing against their classmates throughout the event.

#### (b) Starred Friends List ⭐

* After successfully entering another student's key, players have the option to "star" them.
* Starred friends are saved to a personal list within the player's profile.
* Players can view all their starred friends' details on a dedicated page and **download the list as a PDF**.

#### (c) Key Input System 🔑

* Players exchange keys with classmates and enter them into the input field.
* The system validates the key against the Firestore database.
* **Validation Rules**:
    * Keys are only valid if both students are in the **same classroom**.
    * Players **cannot enter their own key**.
    * **Duplicate key entries** from the same player are ignored.

---

## Points System 🏅

The scoring is simple and designed to encourage interaction.

* **Valid Key Match**: `+10 points`
* Points are automatically tallied and reflected on the leaderboard in real-time.

---

## Classroom Restriction 🚪

A core rule of the game is that interaction is limited to within a single class. The system checks that both the player and the student whose key is entered belong to the same **classroom** before awarding any points. This encourages students to get to know their immediate peers.

---

## Tech Stack 🛠️

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: Node.js / Express
* **Database**: Firebase Firestore (for real-time data)
* **Live Updates**: Firestore snapshot listeners
* **Hosting**: Firebase Hosting
