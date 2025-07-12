import React, { useState } from "react";
import "./GameLayout.css";
import FlappyBirdGame from "./Games/FlappyBird";
import CrossyRoadGame from "./Games/Crossy Road";
import { getParsedGameConfig } from "../api/gameTweak";
// import { generateReskin } from "../api/aiReskin";

const GameLayout: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState("crossy");
    const [paramText, setParamText] = useState("");
    const [selectedAsset, setSelectedAsset] = useState("bird.png");
    const [reskinPrompt, setReskinPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    const assetOptions: Record<string, string[]> = {
        flappy: ["Bird", "Background", "Pipes"],
        crossy: ["Chicken", "Car"],
    };

    const assetList = assetOptions[selectedGame] || [];

    const renderGame = () => {
        switch (selectedGame) {
            case "flappy":
                return <FlappyBirdGame />;
            case "crossy":
                return <CrossyRoadGame />;
            default:
                return null;
        }
    };

    // const handleApplyTweaks = async () => {
    //     if (!paramText.trim()) return;
    //     console.log(paramText);
    //     const config = await getParsedGameConfig(paramText);
    //     console.log("AI config:", config);

    //     if (selectedGame === "flappy") {
    //         (window as any).setFlappyConfig?.(config);
    //     }

    //     // add more game logic for other games later
    // };

    // const handleApplyAll = async () => {
    //     await handleApplyTweaks();

    //     // if (!reskinPrompt.trim()) return alert("Enter a prompt");
    //     setLoading(true);

    //     const inputPath = `public/assets/${selectedAsset}`;
    //     const outputPath = `public/assets/${selectedAsset.replace(".png", "-reskinned.png")}`;

    //     try {
    //     await generateReskin(reskinPrompt, inputPath, outputPath);

    //     // Hot reload the texture in game
    //     const key = selectedAsset.split(".")[0];
    //     (window as any).setSprite?.(key, outputPath);
    //     } catch (err) {
    //     console.error("Reskin failed:", err);
    //     // alert("Failed to generate reskin.");
    //     } finally {
    //     setLoading(false);
    //     }
    // };

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
        };
        console.log("mkcccc:  ", reskinPrompt);
        // ✅ Only perform reskin if prompt is present
        if (reskinPrompt/*.trim()*/) {
            console.log("👉 Sending reskin request");

            const res = await fetch("../api/reskin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                prompt: reskinPrompt,
                asset: selectedAsset
                })
            });

            if (!res.ok) {
                throw new Error("Reskin API request failed");
            }

            const data = await res.json();
            const spriteUrl = data.spriteUrl;

            const key = selectedAsset.replace(".png", ""); // e.g., "bird"
            (window as any).setFlappyConfig?.({
                spriteKey: key,
                spriteUrl
            });
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

                <button className="export-button" onClick={handleApplyAll}>{loading ? "Applying..." : "Export"}</button>
            </div>
        </div>
    );
};

export default GameLayout;
