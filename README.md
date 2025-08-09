# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

To get started, take a look at `src/app/page.tsx`.

## Features

This project includes a native and interactive Nepali calendar. To enable the calendar and other date-related features, you must provide an API key for the Nepali Calendar API.

### News API Setup

This project uses the NewsData.io API to fetch news headlines.

1.  Sign up for a free API key at [NewsData.io](https://newsdata.io/register).
2.  Open the `.env` file in the project.
3.  Set the `NEWSDATAIO_API_KEY` with the key you obtained.

```
NEWSDATAIO_API_KEY="YOUR_API_KEY_HERE"
```

### Genkit AI

This project uses Genkit to connect to Google's AI services for features like Horoscope generation. To enable these AI features, you must provide a Gemini API key.

**IMPORTANT:** You must provide a valid Gemini API key for the AI features to work.

1.  Create an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Open the `.env` file in the project.
3.  Replace `YOUR_API_KEY_HERE` with your actual API key.

```
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```
