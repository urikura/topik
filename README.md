# 🇰🇷 TOPIK I Vocabulary Master (Flashcard & Quiz Web App)

![TOPIK I Vocabulary Quiz & Flashcard App](https://img.shields.io/badge/TOPIK-1671_Words-indigo?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern, responsive Web Application designed for practicing TOPIK I Korean vocabulary words with real-time TTS audio pronunciation, interactive 4-choice quizzes, 3D flashcards, and live dictionary search.

> [!NOTE]
> **Disclaimer**
> This project is an unofficial web application created strictly for **personal Korean language study and programming demonstration purposes**.
> - It is **not** affiliated with, endorsed by, or associated with official TOPIK (Test of Proficiency in Korean) governing bodies, nor any third-party websites.
> - The vocabulary dataset was imported as a sample reference dataset available on the internet.
> - This is a non-commercial, open-source portfolio project.

---

## ✨ Features

- 🔊 **Real-Time Korean Audio (Web Speech API)**
  - Native Korean pronunciation (`ko-KR`) rendered using browser-standard Web Speech API.
  - Supports automatic audio playback on new questions (toggle ON/OFF) and manual audio playback on click.
- 🔀 **Multiple Quiz Modes & Question Customization**
  - **Japanese ➔ Korean**: Choose the correct Hangul word based on the Japanese meaning.
  - **Korean ➔ Japanese**: Choose the correct Japanese meaning based on the Hangul word & pronunciation.
  - **Mix Mode**: Randomly alternates between both modes.
  - **Question Count Options**: Choose `10`, `20`, `50`, `100`, or `All 1,671` questions.
- 🎯 **Interactive 4-Choice Quiz Engine**
  - Dynamic distractor generation from the 1,671 word database.
  - Instant visual feedback, streak combo counter (🔥), correct answer highlights, and sound effects (chime/error tone via Web Audio API).
  - Keyboard shortcuts enabled (`1`, `2`, `3`, `4` to select options; `Enter` / `Space` to advance).
- 🃏 **3D Interactive Flashcards**
  - Flip cards in 3D (Front: Hangul + Audio; Back: Japanese meaning + Romaji reading).
  - Supports shuffling and step-by-step navigation.
- 🔍 **Live Dictionary & Search**
  - Real-time search across all 1,671 words by Hangul, Japanese, or Romaji (e.g., `gage`).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism, Responsive Grid & Flexbox), JavaScript (ES6+)
- **Audio Processing**: Web Speech API (`SpeechSynthesis`), Web Audio API (`AudioContext` for sound FX)
- **Data Source**: `topik-1671_romaji.csv` (1,671 TOPIK I vocabulary items with Japanese meanings and Romaji readings)

---

## 🚀 Getting Started

No complex build step or framework installation required! Runs directly in any modern web browser.

### Option 1: Run with Local Web Server (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/topik-quiz-app.git
cd topik-quiz-app

# Start local server (e.g. via npx serve)
npx serve .

# Or using Python 3
python3 -m http.server 8080
```

Open `http://localhost:8080` in your web browser.

### Option 2: Open Directly in Browser

Simply double-click `index.html` or drag and drop it into your preferred web browser.

---

## 📂 File Structure

```text
.
├── index.html              # Main HTML markup & view layout
├── styles.css              # Dark glassmorphism stylesheet
├── data.js                 # Structured JS dataset of Beginner & Intermediate words
├── app.js                  # Quiz engine, audio manager, and UI state handler
├── topik-1671_romaji.csv   # Beginner vocabulary dataset in CSV format
├── topik-2662_romaji.csv   # Intermediate vocabulary dataset in CSV format
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

---

## 🔗 Data Reference & Attribution

The vocabulary datasets used in this project are referenced from publicly available online learning materials as sample datasets:
*Note: This project and its author have no affiliation or partnership with the website/author referenced below.*

- **Beginner Dataset Reference**: [Trilingual (trilingual.jp) - TOPIK 1 Words List](https://trilingual.jp/jako/20190128-751/)
- **Intermediate Dataset Reference**: [Trilingual (trilingual.jp) - TOPIK 2 Intermediate Words List](https://trilingual.jp/jako/20190307-1161/)

---

## 📝 License

- **Source Code**: [MIT License](LICENSE) (Free to use, modify, and distribute).
- **Vocabulary Data**: Used as sample datasets for educational and learning purposes.

