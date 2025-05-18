# Event Proposal for Anokha Techfest 🌟

This is a React-based project for managing and submitting event proposals for Anokha Techfest. The project is built using Firebase for backend services and ShadCN components for a modern and responsive UI.

## 🚀 Getting Started

## 1. Install dependencies

```sh
npm install
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

---

## 🧼 Code Formatting (Prettier)

To ensure consistent formatting across the project, run:

```bash
npx prettier --write .
```

**✅ Important:** Run this **before committing, pushing, or opening a pull request.**
