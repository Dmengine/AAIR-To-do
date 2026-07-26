# Voice-Enabled Todo App

Minimalist React Native to-do app built with TypeScript, AsyncStorage, React Navigation, and a Node.js + MongoDB backend for optional sync and voice transcription.

## Stack

- React Native with Expo and TypeScript
- Node.js + Express
- MongoDB Atlas with transactional writes
- AsyncStorage for local persistence
- OpenAI Whisper transcription endpoint for voice input

## Features

- Add, edit, complete, and delete tasks
- Local persistence across app launches
- Two-screen navigation: Task List and Add Task
- Voice FAB that records audio and transcribes it into one or more tasks
- Search filtering and due-date support
- Clean light UI tuned to the supplied Stitch design system

## Project Layout

- `mobile/` React Native app
- `server/` Node.js API and MongoDB models
- `.stitch/` downloaded Stitch reference assets

## Setup

1. Install dependencies from the repository root:

```bash
npm install
```

2. Configure the backend environment in `server/.env`:

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI` to your Atlas connection string and `OPENAI_API_KEY` if you want live speech-to-text transcription.

3. Configure the mobile environment in `mobile/.env`:

```bash
cp mobile/.env.example mobile/.env
```

Update `EXPO_PUBLIC_API_URL` if the API runs on a different host.

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

Task writes on the API use MongoDB transactions for create, update, and delete operations. The mobile app also keeps an AsyncStorage copy so the task list survives app restarts even when the network is unavailable.

## Screenshots

Add the final app screenshots to `screenshots/` and embed them here so the evaluation can review the finished build without cloning the project.

