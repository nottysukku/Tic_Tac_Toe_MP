import React, { useState, useEffect } from "react";
import Board from "./Board";
import { Window, MessageList, MessageInput } from "stream-chat-react";
import "./Chat.css";

function Game({ channel, setChannel }) {
  const [playersJoined, setPlayersJoined] = useState(
    channel.state.watcher_count === 2
  );
  const [result, setResult] = useState({ winner: "none", state: "none" });
  const [showPopup, setShowPopup] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(""));
  const [player, setPlayer] = useState("X");
  const [turn, setTurn] = useState("X");

  useEffect(() => {
    const handleUserWatchingStart = (event) => {
      setPlayersJoined(event.watcher_count === 2);
    };

    channel.on("user.watching.start", handleUserWatchingStart);
    channel.on("game-restart", handleGameRestart);

    return () => {
      channel.off("user.watching.start", handleUserWatchingStart);
      channel.off("game-restart", handleGameRestart);
    };
  }, [channel]);

  useEffect(() => {
    if (result.state === "won" || result.state === "tie") {
      setShowPopup(true);
    }
  }, [result]);

  const handleGameRestart = (event) => {
    setBoard(Array(9).fill(""));
    setResult({ winner: "none", state: "none" });
    setPlayer("X");
    setTurn("X");
    setShowPopup(false);
  };

  const restartGame = async () => {
    try {
      await channel.sendEvent({
        type: 'game-restart',
        data: { message: 'restart' }
      });
      handleGameRestart();
    } catch (error) {
      console.error("Error sending restart event:", error);
    }
  };

  if (!playersJoined) {
    return <div id="waiting"> Waiting for other player to join...</div>;
  }

  return (
    <div className="gameContainer">
      <Board 
        board={board} 
        setBoard={setBoard}
        player={player}
        setPlayer={setPlayer}
        turn={turn}
        setTurn={setTurn}
        result={result}
        setResult={setResult}
        channel={channel}
      />

      {/* Chatbox Toggle Button (visible on mobile only) */}
      <button 
        className="chatToggleBtn" 
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        {isChatOpen ? "Close Chat" : "Open Chat"}
      </button>

      {/* Conditionally Render Chatbox */}
      {isChatOpen && (
        <div className="chatWindow">
          <Window>
            <MessageList
              disableDateSeparator
              closeReactionSelectorOnClick
              hideDeletedMessages
              messageActions={["react"]}
            />
            <MessageInput noFiles />
          </Window>
        </div>
      )}

      <button
        onClick={async () => {
          await channel.stopWatching();
          setChannel(null);
        }}
      >
        Leave Game
      </button>

      <button onClick={restartGame} className="restart-button">
        Restart Game
      </button>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            {result.state === "won" && <div>{result.winner} Won The Game</div>}
            {result.state === "tie" && <div>Game Tied</div>}
            <button onClick={() => setShowPopup(false)} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;