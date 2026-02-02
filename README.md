# Zippy App

This is the React Native version of the Zippy website.

## Setup

1.  **Install Dependencies:**
    If dependencies are not installed, run:
    ```sh
    npm install
    npm install axios @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-safe-area-context react-native-screens
    ```

2.  **Configure Backend:**
    Open `src/services/api.js` and update the `BASE_URL`:
    - Android Emulator: `http://10.0.2.2:5000/api` (Default)
    - iOS Simulator: `http://localhost:5000/api`
    - Physical Device: Use your computer's local IP address (e.g., `http://192.168.1.5:5000/api`).

3.  **Run the App:**
    ```sh
    npx expo start
    ```

## Structure

- `src/context/AuthContext.js`: Manages user authentication state using `AsyncStorage` (instead of `localStorage`).
- `src/services/api.js`: API client adapted for Mobile (handling Base URL and Tokens).
- `src/screens`: Contains application screens (Login, Home).
- `App.js`: Main entry point with Navigation setup.
# zippyApp
