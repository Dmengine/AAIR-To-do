# AAIR ToDo

AAIR ToDo is a voice-enabled task manager built with React Native and Expo. It combines a polished mobile UI with optional backend sync so tasks can be stored locally and backed by a Node.js + MongoDB service when needed.

## What it does

- Create, edit, complete, and delete tasks
- Browse tasks in a scrollable list with search filtering
- Open a task detail screen with created and updated timestamps
- Record voice input from the floating action button and transcribe it into task content
- Toggle between light and dark themes
- Persist tasks locally with AsyncStorage while optionally syncing through the API

## Tech stack

- Mobile app: React Native, Expo, TypeScript, React Navigation, Safe Area layout
- UI: custom theme system and reusable task cards
- Backend: Node.js, Express, MongoDB Atlas
- Voice: Expo audio recording with backend transcription support

## Project structure

- mobile/ - Expo app source, screens, navigation, state, and services
- server/ - Express API and MongoDB models/routes
- assets/ - app assets and images
- screenshots/ - app screenshots for reference

## Getting started

1. Install dependencies from the repository root:

```bash
npm install
```

2. Create a backend environment file for the server:

```bash
cp server/.env.example server/.env
```

If the file does not exist yet, create server/.env manually and add at least:

```env
MONGODB_URI=your-mongodb-connection-string
ASSEMBLYAI_API_KEY=your-api-key-if-you-want-live-transcription
PORT=4000
```

3. Optionally create a mobile environment file:

```bash
cp mobile/.env.example mobile/.env
```

If you are testing on a physical device, set EXPO_PUBLIC_API_URL to your local backend address, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000
```

## Run the app

Start the backend:

```bash
npm run server
```

Start the mobile app:

```bash
npm run mobile
```

## Voice flow

From the task list screen, tap the microphone button to enter voice capture mode. The app records audio, sends it to the backend transcription service, and attempts to turn the transcript into a structured task title and description.

## Development checks

Run the mobile TypeScript check:

```bash
./node_modules/.bin/tsc -p mobile/tsconfig.json --noEmit --pretty false
```

Run the mobile test suite:

```bash
npm --workspace mobile run test
```

## Screenshots

Reference screenshots are available in the screenshots/ folder.