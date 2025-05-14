# Unified Payment Analytics Platform - Frontend

## Overview

This repository contains the frontend mobile application for the Unified Payment Analytics Platform. It's built using React Native with Expo, TypeScript, and utilizes Apollo Client for GraphQL communication with the backend.

The app provides users with a seamless experience to manage their finances, track transactions from various payment methods (UPI, Card, Bank), view spending analytics, and interact with AI-powered financial insights.

## Features

* **User Authentication:**
  * Secure login and signup (currently demonstrated with email/password, adaptable for phone OTP).
  * Session management using JWT.
* **Dashboard:** Overview of total balance (mocked), quick actions like "Scan & Pay", and a summary of recent transactions.
* **Transaction Management:**
  * UPI Payment flow.
  * Payment success screen with an option to categorize transactions.
  * AI-suggested category pre-fill on the success screen.
  * Detailed transaction view.
  * (Future) List all transactions with filtering.
* **Analytics Screen:**
  * Visualization of spending trends using charts.
  * Breakdown of spending by category.
  * (Future) More detailed insights and reports.
* **Scan & Pay:** QR code scanning functionality (using `expo-camera`) to initiate UPI payments.
* **Profile Management:**
  * View and edit user profile information (name, email, etc.).
  * (Future) Manage linked payment methods (UPI, Cards, Bank Accounts).
  * (Future) App settings (dark mode, notifications, security).
* **Rewards & Coupons:** (Currently with mock data) Display user rewards and available coupons.
* **Notifications:** View system, promotional, and transaction-related notifications.
* **GraphQL Integration:** Uses Apollo Client for all communication with the backend GraphQL API.
* **Type Safety:** Leverages GraphQL Code Generator for generating TypeScript types from the backend schema and operations.

## Technology Stack

* **Framework:** React Native (with Expo)
* **Language:** TypeScript
* **Navigation:** Expo Router
* **State Management:** React Context (for Auth), component-level state (`useState`, `useEffect`)
* **GraphQL Client:** Apollo Client
* **UI Components:** Standard React Native components, `lucide-react-native` for icons.
* **Charts:** `react-native-chart-kit` (for Analytics)
* **Camera:** `expo-camera` (for QR scanning)
* **Image Picker:** `expo-image-picker` (for profile picture)
* **Date Formatting:** `date-fns`
* **Styling:** StyleSheet API, custom fonts (`Inter`).
* **Local Storage:** `@react-native-async-storage/async-storage` (for auth token).

## Prerequisites

* Node.js (LTS version recommended, e.g., v18.x or v20.x)
* npm or yarn
* Expo CLI: `npm install -g expo-cli` or `yarn global add expo-cli`
* A running instance of the [Unified Payment Analytics Backend](<link-to-your-backend-repo-if-separate>)
* An iOS simulator/device or Android emulator/device for running the app.
* (Optional) Watchman (for macOS, improves Metro bundler performance)

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone <your-frontend-repository-url>
    cd <your-frontend-directory-name>
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    ```

3. **Set up Environment Variables:**
    * Create a `.env` file in the root of your frontend project.
    * Add the following variable, pointing to your running backend GraphQL server:

    **`.env` Example:**

    ```env
    # URL of your GraphQL Backend Server
    # For Android emulator if backend is on same machine: http://10.0.2.2:4000/graphql
    # For iOS simulator if backend is on same machine: http://localhost:4000/graphql
    # For physical device on same Wi-Fi: http://<your-computer-local-ip>:4000/graphql
    EXPO_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:4000/graphql"
    ```

    *Replace `http://localhost:4000/graphql` with the correct URL for your backend, especially considering if you are using an emulator or physical device.*

4. **Ensure Backend is Running:**
    Your backend server (Node.js/GraphQL Yoga), PostgreSQL, Redis, and the Python AI/ML service must be running for the app to function fully.

## Running the Application

1. **Start the Metro Bundler (Development Server):**

    ```bash
    npx expo start
    # or
    # yarn start
    ```

    This will open the Metro bundler in your terminal. You can then:
    * Press `a` to open on an Android emulator or connected device.
    * Press `i` to open on an iOS simulator or connected device (requires macOS).
    * Press `w` to open in a web browser (some native features like camera might not work).
    * Scan the QR code with the Expo Go app on your physical device.

2. **Clear Cache (if encountering issues):**

    ```bash
    npx expo start -c
    ```

## GraphQL Code Generation

This project uses GraphQL Code Generator to create TypeScript types and typed Apollo Client hooks from the backend schema and local GraphQL operations.

* **Configuration:** `codegen.ts`
* **Operations:** Defined in `src/graphql/operations.ts`
* **Generated Output:** `src/graphql/generated/graphql.tsx`

**To run codegen:**

1. Ensure your backend GraphQL server is running.
2. Execute the script:

    ```bash
    npm run codegen
    # or
    # yarn codegen
    ```

    Run this command whenever you change your GraphQL schema on the backend or modify/add operations in `src/graphql/operations.ts`.

**To watch for changes and regenerate automatically during development:**

```bash
npm run codegen:watch
# or
# yarn codegen:watch
```

## Project Structure (Key Directories)

```markdown
.
├── app/                      # Expo Router based routing
│   ├── (auth)/               # Authentication screens (login, signup)
│   ├── (tabs)/               # Main tab-based navigation screens (home, analytics, etc.)
│   ├── profile/              # Profile related sub-screens
│   ├── _layout.tsx           # Root layout for the app
│   ├── notifications.tsx     # Notifications screen
│   └── ...                   # Other top-level screens/routes
├── assets/                   # Static assets (images, fonts not loaded via expo-google-fonts)
├── components/               # Reusable UI components (if any)
├── constants/                # Constant values (colors, styles, etc.) (if any)
├── context/
│   └── authContext.tsx       # Authentication context for managing user state
├── graphql/
│   ├── operations.ts         # Definitions of GraphQL queries and mutations (using gql tag)
│   └── generated/
│       └── graphql.tsx       # Auto-generated types and hooks by GraphQL Code Generator
├── hooks/                    # Custom React hooks
│   └── useFrameworkReady.ts  # Example custom hook
├── lib/                      # Utility functions, Apollo Client setup
│   └── apolloClient.ts       # Apollo Client configuration
├── types/                    # Custom TypeScript type definitions (e.g., src/types/index.ts)
├── .env                      # Environment variables (ignored by Git)
├── codegen.ts                # GraphQL Code Generator configuration
├── package.json
└── tsconfig.json
```

## Available Scripts (from `package.json`)

* `npm start` or `yarn start`: Starts the Expo development server (equivalent to `npx expo start`).
* `npm run android` or `yarn android`: Starts the app on a connected Android device or emulator.
* `npm run ios` or `yarn ios`: Starts the app on an iOS simulator or connected device (macOS only).
* `npm run web` or `yarn web`: Starts the app in a web browser.
* `npm run codegen`: Generates GraphQL types and hooks.
* `npm run codegen:watch`: Watches for changes and regenerates GraphQL types/hooks.

*(Add any other custom scripts you have, like `lint`)*

## State Management

* **Authentication State:** Managed globally via `AuthContext` (`src/context/authContext.tsx`), which stores the user object and JWT token.
* **GraphQL Data (Caching):** Apollo Client handles server-side data fetching and caching.
* **Local UI State:** Component-level state is managed using React's `useState` and `useEffect` hooks.

## Further Development & TODOs

* Implement phone OTP login flow.
* Replace all mock data with live data from GraphQL API (e.g., total balance, detailed transactions for dashboard, rewards, coupons).
* Implement functionality for adding/managing payment methods in the Profile section.
* Develop full CRUD operations for user profile editing.
* Enhance UI/UX for all screens, including loading skeletons and error states.
* Add more robust form validation.
* Implement missing features like "Share Transaction", "Download Receipt", "Report Issue".
* Write unit and integration tests.
* Set up push notifications.
* Address any `TODO` comments in the code.
