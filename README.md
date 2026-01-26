# NutriVoice 🍎🎙️

>**A voice-first, AI-powered nutrition assistant that makes calorie tracking effortless.**

NutriVoice allows you to log your meals simply by speaking. Powered by **Google Gemini**, it automatically parses your voice commands into structured nutritional data (calories, protein, carbs, fats) and provides personalized health insights.

![App Screenshot](https://via.placeholder.com/800x400?text=NutriVoice+Dashboard+Preview) 
*(Replace with actual screenshot)*

## ✨ Key Features

- **🗣️ Voice-Powered Logging**: Just say "I had a grilled chicken salad and a diet coke" and let AI handle the rest.
- **🤖 AI Health Insights**: Get daily analysis and personalized health tips based on your logs and goals.
- **📊 Interactive Dashboard**: View your daily progress, calorie targets, and macro breakdown at a glance.
- **📈 Analytics & History**: Track your nutrition trends over time and manage past logs.
- **🔔 Smart Reminders**: Set custom reminders for hydration, meals, or flexible habits.
- **📱 PWA Ready**: Installable on mobile devices for a native-like experience.
- **🔒 Privacy First**: All your data is stored locally on your device.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Integration**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/genai) (Gemini)
- **Styling**: Tailwind CSS (inferred from utility usage) & Lucide Icons
- **Routing**: React Router v7
- **Date Handling**: date-fns

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- A **Google Gemini API Key** (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd nutrivoice
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```bash
    # .env.local
    GEMINI_API_KEY=your_actual_api_key_here
    ```

### Running the App

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the URL shown in the terminal).

## 📂 Project Structure

```
nutrivoice/
├── src/
│   ├── components/      # UI Components (Dashboard, VoiceRecorder, etc.)
│   ├── services/        # Logic for Gemini AI and LocalStorage
│   ├── App.tsx          # Main application & routing logic
│   ├── types.ts         # TypeScript interfaces (FoodLog, UserSettings)
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
