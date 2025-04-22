# AI-Powered Notes App

A mini AI-powered notes application built with Next.js, TypeScript, TailwindCSS, Shadcn, and Supabase.

## Features

- **User Authentication**: Sign up and sign in with email/password or Google
- **Notes Management**: Create, read, update, and delete notes
- **AI Summarization**: Automatically summarize your notes using AI
- **Responsive Design**: Works on all device sizes

## Technology Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Supabase (Authentication, Database)
- **State Management**: React Query
- **AI Integration**: DeepSeek API

## Getting Started

### Prerequisites

- Node.js (v22.14.0+)
- npm (v10.9.2+)
- Supabase account
- DeepSeek API key (or alternative)

### Installation

1. Clone the repository
git clone https://github.com/yourusername/ai-notes-app.git
cd ai-notes-app

text

2. Install dependencies
npm install

text

3. Create a `.env.local` file in the root directory with the following variables:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

