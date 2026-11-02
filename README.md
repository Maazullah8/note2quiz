Note2Quiz

Turn messy lecture notes into interactive quizzes and study flashcards in seconds.

Note2Quiz is a full-stack, AI-powered study companion built to help high school and university students master their class material faster. Instead of spending hours writing practice questions by hand, simply paste raw notes, text summaries, or lecture transcriptions—Note2Quiz automatically structures them into customized multiple-choice quizzes and interactive flip-flashcards.
Features

Instant Quiz Generation: Generates 10 targeted multiple-choice practice questions with detailed answer explanations using Google's Gemini models.

Interactive Flashcards: Automatically extracts key vocabulary terms, definitions, and core concepts into sleek flip cards.

Local Progress Persistence: Saves generated quizzes and cards directly in your browser's localStorage so study sessions survive page refreshes.

Mobile-First Design: Optimized layout for fast studying on phones, tablets, or laptops.

Zero Setup Required: Free to use with direct notes-to-quiz generation.

 Tech Stack

Framework: Next.js 16 (App Router, Turbopack)

Frontend: React, Tailwind CSS

AI Processing: @google/genai SDK (gemini-3.5-flash)

Deployment: Vercel

 Getting Started Locally
Prerequisites

Node.js (v18 or higher)

A Gemini API key from Google AI Studio

Installation

Clone the repository:
    Bash

    git clone https://github.com/Maazullah8/note2quiz.git
    cd note2quiz

Install dependencies:
    Bash

    npm install

Set up environment variables:
Create a .env.local file in the root directory:
Code snippet

    NEXT_PUBLIC_GEMINI_KEY=your_gemini_api_key_here

Run the development server:
    Bash

    npm run dev

    Open http://localhost:3000 with your browser to see Note2Quiz in action!
