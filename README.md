# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Features

This project includes a native and interactive Nepali calendar. To enable the calendar and other date-related features, you must provide an API key for the Nepali Calendar API.

### Nepali Calendar API Setup

1.  Subscribe to the [Nepali Calendar API on RapidAPI](https://rapidapi.com/sishir/api/nepali-calendar-api). A free plan is available.
2.  After subscribing, you will get an `X-RapidAPI-Key`.
3.  Open the `.env` file in the project.
4.  Set the `RAPIDAPI_KEY` with the key you obtained.

```
RAPIDAPI_KEY="YOUR_RAPIDAPI_KEY_HERE"
```

### Genkit AI

This project uses Genkit to connect to Google's AI services. To enable AI features, you must provide a Gemini API key.

**IMPORTANT:** You must provide a valid Gemini API key for the AI features to work.

1.  Create an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Open the `.env` file in the project.
3.  Replace `YOUR_API_KEY_HERE` with your actual API key.

```
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```
