import React, { useState } from "react";
import "./GameLayout.css";
import FlappyBirdGame from "./Games/FlappyBird";
import CrossyRoadGame from "./Games/Crossy Road";
import WhackAMoleGame from "./Games/Whack A Mole.tsx";
import SpeedRunnerSolo from "./Games/Speed Runner.tsx";
import MatchThree from "./Games/Match 3.tsx";
import { getParsedGameConfig } from "../api/gameTweak";
// import { generateReskin } from "../api/aiReskin";

const GameLayout: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState("whack");
    const [paramText, setParamText] = useState("");
    const [selectedAsset, setSelectedAsset] = useState("mole.png");
    const [reskinPrompt, setReskinPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const assetOptions: Record<string, string[]> = {
        flappy: ["Bird", "Background", "Pipe"],
        crossy: ["Chicken", "Car"],
        whack: ["Mole"],
        runner: ["Player", "Tiles"],
        match3: ["Tile1", "Tile2", "Tile3"]
    };

    const assetList = assetOptions[selectedGame] || [];

    const renderGame = () => {
        switch (selectedGame) {
            case "flappy":
                return <FlappyBirdGame />;
            case "crossy":
                return <CrossyRoadGame />;
            case "whack":
                // console.log("wackwack yayyyy");
                return <WhackAMoleGame />;
            case "runner":
                return <SpeedRunnerSolo />;
            case "match3":
                // console.log("match3 yayyyy");
                return <MatchThree />;
            default:
                return null;
        }
    };

    
    const handleApplyAll = async () => {
    setLoading(true);
    console.log("👉 Running handleApplyAll with:", { paramText, reskinPrompt });
    try {
        // ✅ Apply game parameter tweaks if provided
        if (paramText.trim()) {
            console.log(paramText);
            const config = await getParsedGameConfig(paramText);
            console.log("AI config:", config);

            if (selectedGame === "flappy") {
                (window as any).setFlappyConfig?.(config);
            }
            else if (selectedGame === "runner") {
                (window as any).setRunnerConfig?.(config);
            }
            else if (selectedGame === "whack") {
                (window as any).setWhackamoleConfig?.(config);
            }
            else if (selectedGame === "crossy") {
                (window as any).setCrossyroadConfig?.(config);
            }
            else if (selectedGame === "match3") {
                (window as any).setMatch3Config?.(config);
            }
            else{console.log("badha vaala error");}
        };
        console.log("mkcccc:  ", reskinPrompt);
        // ✅ Only perform reskin if prompt is present

        console.log("SA::  ", selectedAsset);
        let normalizedAsset = selectedAsset.toLowerCase();
        if (!normalizedAsset.endsWith(".png")) {
            normalizedAsset += ".png";
        }
        console.log("NA::  ", normalizedAsset);
        if (reskinPrompt/*.trim()*/) {
            console.log("👉 Sending reskin request");

            const res = await fetch("/api/reskin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                prompt: reskinPrompt,
                asset: normalizedAsset
                })
            });

            if (!res.ok) {
                throw new Error("Reskin API request failed");
            }

            const data = await res.json();
            const spriteUrl = data.spriteUrl;

            let key = normalizedAsset.replace(".png", ""); // e.g., "bird"
            if (key==="background"){
                key="bg";
            }
            console.log("leyyyyyy: ", key);
            // (window as any).setFlappyConfig?.({
            //     spriteKey: key,
            //     spriteUrl
            // });
            if (selectedGame === "flappy") {
                (window as any).setFlappyConfig?.({ spriteKey: key, spriteUrl });
            } else if (selectedGame === "runner") {
                (window as any).setRunnerConfig?.({ spriteKey: key, spriteUrl });
            } else if (selectedGame === "whack") {
                console.log("whackwhackwhack");
                (window as any).setWhackamoleConfig?.({ spriteKey: key, spriteUrl });
            }
            else if (selectedGame === "crossy") {
                (window as any).setCrossyroadConfig?.({ spriteKey: key, spriteUrl });
            }
            else if (selectedGame === "match3") {
                (window as any).setMatch3Config?.({ spriteKey: key, spriteUrl });
            }

        }
    } catch (err) {
        console.error("Export failed:", err);
        alert("Something went wrong during export.");
    } finally {
        setLoading(false);
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
                    <option value="runner">Speed Runner</option>
                    <option value="match3">Simple Match Three</option>
                </select>

                <h2>AI Reskinning</h2>

                <select 
                    className="dropdown"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                >
                    {assetList.map((asset) => (
                        <option key={asset}>{asset}</option>
                    ))}
                </select>

                <textarea
                    className="input-box"
                    placeholder="Describe how you would like this asset to look like"
                    value={reskinPrompt}
                    onChange={(e) => setReskinPrompt(e.target.value)}
                />

                <h2>Parameter Controls</h2>

                <textarea
                    className="input-box"
                    placeholder="Describe any changes to the game you would like"
                    value={paramText}
                    onChange={(e) => setParamText(e.target.value)}
                />

                <button className="export-button" onClick={handleApplyAll}>{loading ? "Applying..." : "Apply"}</button>
            </div>
        </div>
    );
};

export default GameLayout;
