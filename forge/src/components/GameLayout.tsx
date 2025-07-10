import React, { useState } from "react";
import "./GameLayout.css";

import FlappyBirdGame from "./Games/FlappyBird";
import CrossyRoadGame from "./Games/Crossy Road";
import WhackAMoleGame from "./Games/Whack A Mole.tsx";

const GameLayout: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState("flappy");

    const assetOptions: Record<string, string[]> = {
        flappy: ["Bird", "Background", "Pipes"],
        crossy: ["Chicken", "Car"],
        whack: ["Mole"]
    };

    const renderGame = () => {
        switch (selectedGame) {
            case "flappy":
                return <FlappyBirdGame />;
            case "crossy":
                return <CrossyRoadGame />;
            case "whack":
                return <WhackAMoleGame />;
            default:
                return null;
        }
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
                />

                <button className="export-button">Export</button>
            </div>
        </div>
    );
};

export default GameLayout;
