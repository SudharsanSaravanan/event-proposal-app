# Event Proposal for Anokha Techfest 🌟

This is a React-based project for managing and submitting event proposals for Anokha Techfest. The project is built using Firebase for backend services and ShadCN components for a modern and responsive UI.

## 🚀 Getting Started

## 1. Install dependencies

```sh
npm install
npm install date-fns
```

## 2. Install Firebase and Firebase Tools

```sh
npm install firebase
npm install -g firebase-tools
npm install react-firebase-hooks
```

## 3. Set up ShadCN

Initialize ShadCN:

```sh
npx shadcn@latest init
```

Add necessary components:

```sh
npx shadcn@latest add input button card select alert sidebar tabs command popover
```

## 4. Install Lucide-React

```sh
npm install lucide-react
```

## 5. Set up Firebase Configuration

Create a file named .env.local in your project root and add:

```sh
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 6. Set up Firebase Admin SDK for Reviewer System

```sh
npm install firebase-admin
```

Get Firebase Admin credentials:

1. Go to your Firebase project console
2. Click on the gear icon (⚙️) in the left sidebar to open Project Settings
3. Go to the "Service accounts" tab
4. Click on "Generate new private key" button
5. Save the downloaded JSON file securely

Add to your .env.local file:

```sh
# Admin SDK config
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
```

Replace the values with the ones from:

- Your Firebase project settings for the public values
- The downloaded service account JSON for the admin values

## 7. Start the development server

```sh
npm run dev
```

## To create a project in firebase follow these steps carefully:

1. Go to the Firebase Console
2. Click on "Add project" or "Create a project" button
3. Enter your project name (e.g., "anokha-techfest-proposals")
4. Click "Continue"
5. Choose whether to enable Google Analytics for your project:
   - Select "Enable Google Analytics for this project" if you want analytics
   - Or toggle it off if you don't need analytics
   - Click "Continue"
6. If you enabled Analytics, configure Google Analytics:
   - Select your Analytics account or create a new one
   - Choose your country/region
   - Accept the terms and click "Create project"
7. Wait for Firebase to set up your project (this may take a few moments)
8. Click "Continue" when the setup is complete
9. You'll be redirected to your Firebase project dashboard
10. Set up Authentication:
    - Click on "Authentication" in the left sidebar
    - Click "Get started"
    - Go to the "Sign-in method" tab
    - Enable your preferred sign-in providers (Email/Password is recommended)
11. Set up Firestore Database:
    - Click on "Firestore Database" in the left sidebar
    - Click "Create database"
    - Choose "Start in test mode" for development (you can change this later)
    - Select your database location
    - Click "Done"
12. Get your Firebase configuration:
    - Click on the gear icon (⚙️) next to "Project Overview"
    - Select "Project settings"
    - Scroll down to "Your apps" section
    - Click on the web icon </>
    - Register your app with a nickname
    - Copy the configuration object for your .env.local file

Your Firebase project is now ready to use with your application!

## Managing User Roles in Firebase

When developing or testing user and reviewer functionalities, manual role adjustment may be
required through the Firebase console. Follow these steps to modify user roles:

## Steps to Update User Roles:

1. Navigate to your Firebase project console
2. Select "Firestore Database" from the left sidebar
3. Click on your preferred collection (typically "Auth" or "Users")
4. Select the specific document for the user whose role needs modification
5. A document details panel will appear displaying all user fields and data
6. Locate the "role" field within the document
7. Click on the edit icon next to the "role" field
8. Update the role value to the desired permission level (e.g., "User", "Reviewer")
9. Click "Update" to save the changes

## Note 1 :

Role changes take effect immediately and will be reflected in the application upon the user's
next authentication or page refresh.

## Reference Screenshot:

![Screenshot 2025-05-30 182409](https://github.com/user-attachments/assets/08415d00-eb4e-4dbd-9939-8fc56761149a)

---

## Note 2 :

To fetch reviewer proposals, Firestore indexing must be enabled.
When an API call is made from the reviewer 'View Proposals' page,
a link to create the required index will be logged in the terminal.
(i.e)When this API is triggered Firestore will log a helpful link in the terminal The link looks like:
https://console.firebase.google.com/firestore/indexescreate_composite=...

Clicking this link will take you to Firestore’s console with the "Create Index" form pre-filled. Just click "Create".

## Reference Screenshot:

![Image](https://github.com/user-attachments/assets/10d9a32f-c185-423b-8458-44768f14c2b5)

## 🧼 Code Formatting (Prettier)

To ensure consistent formatting across the project, run:

```bash
npx prettier --write .
```

**✅ Important:** Run this **before committing, pushing, or opening a pull request.**
