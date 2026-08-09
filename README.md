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

## 🏗️ System Architecture & Technical Design

### Request Flow
1. **Client Submission:** Users submit data (e.g., proposal forms or reviewer actions) via the React frontend.
2. **Gateway Validation:** Next.js API Routes intercept the request and validate the JSON payload using strictly defined Zod schemas.
3. **Database Execution:** If validation passes, Firestore SDK services (`app/api/proposalService.js`, etc.) execute the query.
4. **Data Persistence:** Data is written to Google Cloud Firestore (NoSQL), organizing parent documents and subcollections (like `History`).
5. **Client Sync:** The frontend receives the response, updates state, and renders the success/failure UI.

### API Design
The backend relies on Next.js App Router API endpoints that act as secure RESTful gateways to the Firestore database.
- **Strict Validation Gateway:** All incoming payloads are validated using Zod before any database interaction.
- **Decoupled Architecture:** Database logic is abstracted away from API routes into service files (e.g., `proposalService.js`, `userService.js`).
- **Stateless & Serverless:** API routes execute statelessly via Vercel/Next.js edge and serverless environments.

### Schema Design & Data Modeling
Given Firestore is a schema-less NoSQL database, structural integrity is enforced entirely at the application layer using Zod schemas (`/schemas/proposal.schema.js`, `/schemas/user.schema.js`).
- **Denormalized Hierarchy:**
  - `Auth`: Root collection storing user profiles and roles.
  - `Proposals`: Root collection tracking active event proposals and their current approval states.
  - `Proposals/{id}/History`: Subcollection used to archive past versions, minimizing the parent document size.
- **Dynamic Validation (Zod `superRefine`):** Conditional schema constraints are actively applied (e.g., if `isIndividual` is false, `groupDetails` must be provided; if a user is a `Reviewer`, `level` must be a number).

### Unique Constraints
- **User Uniqueness:** Firebase Authentication inherently guarantees unique email identities.
- **Data Deduplication:** We rely on Firestore auto-generated Document IDs for uniqueness across proposals and history items.
- **Email Domain Restriction:** Zod regex ensures only `@cb.students.amrita.edu` emails can register.

### Transactions and Idempotency
- **Atomic Operations:** Instead of reading an array, modifying it in Node, and writing it back, the API strictly uses Firestore's `arrayUnion` operator (e.g., forwarding proposals). This is an atomic database-level operation that prevents duplication and guarantees idempotency, meaning the same request sent twice won't corrupt the array.
- **Subcollections vs Arrays:** When dealing with potentially massive data (e.g., full version histories), we use subcollections instead of arrays to bypass Firestore's 1MB document size limit and avoid transaction bottlenecks.

### Concurrency
- **Race Condition Prevention:** By avoiding read-modify-write patterns and strictly utilizing Firestore atomic field operators (`arrayUnion`), concurrent updates by multiple reviewers do not overwrite each other.
- **Version Bumping:** The `version` integer in the schema acts as a simplified optimistic concurrency control mechanism; it increments sequentially when major status changes occur (like a transition to "reviewed").

### Error Handling
- **Predictable API Responses:** All service methods implement robust `try/catch` blocks.
- **Standardized Status Codes:** API routes catch exceptions and map them to appropriate HTTP status codes (e.g., 400 for Zod schema validation errors, 500 for Firestore operation failures).
- **Zod Error Formatting:** Zod validation failures return precise paths and custom `ZodIssueCode.custom` messages so the frontend can easily display form-specific error states to the user.
