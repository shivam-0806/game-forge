
# Game Forge: AI-Powered 2D Game Reskinning and Export Tool

## Overview

Game Forge is a no-cost, AI-integrated platform designed to simplify the process of reskinning, tweaking, and exporting 2D HTML5 games. It enables users to quickly generate variations of existing games without writing code, offering both convenience and creative control. The platform is built using React for the frontend and Phaser 3 for game logic, with AI-assisted asset generation handled through open-source models.

## Features

### 1. AI-Based Reskinning
- Users can choose a base game (e.g., Flappy Bird, Match-3).
- Prompts or base images are used to generate new sprites through an image-to-image pipeline.
- Reskinned assets are injected automatically into the game logic.

### 2. Gameplay Configuration
- Editable gameplay parameters through a UI interface:
  - Gravity
  - Jump strength
  - Obstacle spawn rate
  - Match grid tile types
- Settings are saved in a dynamic `config.json` used during runtime.

### 3. HTML5 Game Export
- Games can be exported into a standalone HTML5 package:
  - `index.html`
  - `main.js`
  - `config.json`
  - `assets/`
- The package can be played offline or hosted on static site platforms.

### 4. No-Code Interface
- A clean user interface allows asset uploads, text prompts, and configuration editing.
- The final game can be previewed directly in the browser.

### 5. Offline-Friendly AI Integration
- Uses open-source models hosted on Hugging Face via Gradio clients.
- No reliance on paid or closed APIs like Scenario.gg or Replicate.
- Can run entirely offline with dependencies cached.

## Competitor Comparison

| Platform          | AI Integration | Customizable | Export Support | Free to Use |
|------------------|----------------|--------------|----------------|-------------|
| Game Forge          | Yes            | Yes          | Yes            | Yes         |
| GDevelop         | No             | Yes          | Yes            | Yes         |
| Construct 3      | No             | Yes          | Yes            | No          |
| Scenario.gg      | Yes (paid)     | Limited      | Yes            | No          |
| Modd.io          | No             | No           | No             | Yes         |

Game Forge stands out by offering AI-driven customization without financial or platform lock-in.

## Applications

### Education and Learning
Useful for introducing game development concepts in classrooms without requiring programming knowledge.

### Thematic or Event-Based Games
Allows custom game generation for events, festivals, and localized themes with ease.

## Technical Stack

| Component   | Technology          |
|-------------|---------------------|
| Frontend    | React + Vite         |
| Game Engine | Phaser 3             |
| Backend     | Node.js        |
| AI Pipeline | Google Gemini + Cohere client |

## Future Improvements

- Support for additional game templates (platformers, puzzle games)
- Natural language-based configuration (e.g., "make it harder")
- In-browser asset editor
- PWA (Progressive Web App) support for mobile install
- Multiplayer support via WebSockets

## Setup Instructions

### Prerequisites

- Node.js (v20 or later)
- Python (for local server)
- React

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/Game Forge.git
cd Game Forge
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. (Optional) If you want to run the backend server for AI reskinning:

```bash
node src/server.cjs
```

The backend will run at `http://localhost:3001`.

### Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

### Exported Games

Exported games are generated as `.zip` files containing:

- `index.html`
- `main.js`
- `config.json`
- `assets/`

You can host these exports or submit them to platforms like itch.io.

## Services and APIs Used

### AI Services Used

- **Cohere Command-R plus**
  - Used for text generation including prompt interpretation, gameplay config tweaking, and natural language responses.

- **Google Gemini 2.0 Flash Preview**
  - Used for image-to-image reskinning of sprites based on uploaded assets and user style prompts.
  - Capable of fast, low-latency in-browser generation suited for real-time game customization.


### Game Rendering

- **Phaser 3**:
  - HTML5 game engine used for all templates

### Local Testing

You can test the exported HTML5 games using:

```bash
python -m http.server
```

Then open `http://localhost:8000` in your browser.

#### **Game Forge brings together creativity, code-free design, and AI-driven automation to make game development as intuitive as playing the game itself - whether you're a developer, a designer, or just someone with an idea and a few clicks to spare.**