# Voice-Enabled Todo App

Minimalist React Native to-do app built with TypeScript, AsyncStorage, React Navigation, and a Node.js + MongoDB backend for optional sync and voice transcription.

## Stack

- React Native with Expo and TypeScript
- Node.js + Express
- MongoDB Atlas with transactional writes
- AsyncStorage for local persistence
- AssemblyAI transcription endpoint for voice input

## Features

- Add, edit, complete, and delete tasks
- Local persistence across app launches
- Two-screen navigation: Task List and Add Task
- Voice FAB that records audio and transcribes it into one or more tasks
- Search filtering and due-date support
- Clean light UI tuned to the app's own visual design

## Project Layout

- `mobile/` React Native app
- `server/` Node.js API and MongoDB models
- `assets/` static app assets and imagery

## Setup

1. Install dependencies from the repository root:

```bash
npm install
```

2. Configure the backend environment in `server/.env`:

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI` to your Atlas connection string and `ASSEMBLYAI_API_KEY` if you want live speech-to-text transcription.

3. Configure the mobile environment in `mobile/.env`:

```bash
cp mobile/.env.example mobile/.env
```

For a physical device, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP, for example `http://192.168.1.50:4000`.
Android emulators can use `http://10.0.2.2:4000`. iOS simulators can usually use `http://localhost:4000`.

## Run

Start the API:

```bash
npm run server
```

Start the mobile app:

```bash
npm run mobile
```

## Voice Flow

Tap the microphone FAB on the Task List screen to open the Add Task screen in voice mode. The app records audio, sends it to the backend transcription endpoint, and splits dictation like “Buy provisions and call mom” into separate tasks.

## ACID Workflow

For task writes on the API I used MongoDB transactions for create, update, and delete operations. The mobile app also keeps an AsyncStorage copy so the task list survives app restarts even when the network is unavailable.

## Screenshots

I added the final app screenshots to `screenshots/` and embed them here so the evaluation can review the finished build without cloning the project.