import React from "react";
import "./GameLayout.css";
import FlappyBirdGame from "./Games/FlappyBird.tsx";

const GameLayout: React.FC = () => {
    return (
        <div className="game-layout">
            <div className="game-window">
                <FlappyBirdGame />
            </div>

            <div className="control-panel">
                <select className="dropdown">
                    <option>Flappy Bird</option>
                    <option>Crossy Road</option>
                    <option>Flappy Bird</option>
                    <option>Flappy Bird</option>
                </select>

                <h2>AI Reskinning</h2>

                <select className="dropdown">
                    <option>Bird</option>
                    <option>Background</option>
                    <option>Pipes</option>
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
