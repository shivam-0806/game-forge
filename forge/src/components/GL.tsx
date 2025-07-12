import React, { useState } from "react";
import "./GameLayout.css";

import FlappyBirdGame from "./Games/FlappyBird";
import CrossyRoadGame from "./Games/Crossy Road";
import WhackAMoleGame from "./Games/Whack A Mole.tsx";
import SpeedRunnerSolo from "./Games/Speed Runner.tsx";
import { getParsedGameConfig } from "../api/gameTweak";

const GameLayout: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState("crossy");
    const [paramText, setParamText] = useState("");

    const assetOptions: Record<string, string[]> = {
        flappy: ["Bird", "Background", "Pipes"],
        crossy: ["Chicken", "Car"],
        whack: ["Mole"],
        runner: ["Runner", "Tiles"]
    };

    const renderGame = () => {
        switch (selectedGame) {
            case "flappy":
                return <FlappyBirdGame />;
            case "crossy":
                return <CrossyRoadGame />;
            case "whack":
                return <WhackAMoleGame />;
            case "runner":
                return <SpeedRunnerSolo />;
            default:
                return null;
        }
    };

    const handleApplyTweaks = async () => {
        if (!paramText.trim()) return;
        console.log(paramText);
        const config = await getParsedGameConfig(paramText);
        console.log("AI config:", config);

        if (selectedGame === "flappy") {
            (window as any).setFlappyConfig?.(config);
        }

        // add more game logic for other games later
    };

    return (
        <div className="game-layout">
            <div className="game-window">
                {renderGame()}
            </div>

            <div className="control-panel">
                <select
                    className="dropdown"
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                >
                    <option value="flappy">Flappy Bird</option>
                    <option value="crossy">Crossy Road</option>
                    <option value="whack">Whack-a-mole</option>
                    <option value="runner">Speed Runner</option>
                </select>

                <h2>AI Reskinning</h2>

                <select className="dropdown">
                    {assetOptions[selectedGame].map((asset) => (
                        <option key={asset}>{asset}</option>
                    ))}
                </select>

                <textarea
                    className="input-box"
                    placeholder="Describe how you would like this asset to look like"
                />

                <h2>Parameter Controls</h2>

                <textarea
                    className="input-box"
                    placeholder="Describe any changes to the game you would like"
                    value={paramText}
                    onChange={(e) => setParamText(e.target.value)}
                />

                <button className="export-button" onClick={handleApplyTweaks}>Export</button>
            </div>
        </div>
    );
};

export default GameLayout;
