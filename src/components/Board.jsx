import React, { useEffect } from "react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import Square from "./Square";
import { Patterns } from "../WinningPatterns";

function Board({ board, setBoard, player, setPlayer, turn, setTurn, result, setResult, channel }) {
  const { client } = useChatContext();

  useEffect(() => {
    checkIfTie();
    checkWin();
  }, [board]);

  useEffect(() => {
    const handleGameMove = (event) => {
      if (event.type === "game-move" && event.user.id !== client.userID) {
        const currentPlayer = event.data.player === "X" ? "O" : "X";
        setPlayer(currentPlayer);
        setTurn(currentPlayer);
        setBoard(
          board.map((val, idx) => {
            if (idx === event.data.square && val === "") {
              return event.data.player;
            }
            return val;
          })
        );
      }
    };

    channel.on("game-move", handleGameMove);

    return () => {
      channel.off("game-move", handleGameMove);
    };
  }, [channel, client.userID, board, setBoard, setPlayer, setTurn]);

  const chooseSquare = async (square) => {
    if (turn === player && board[square] === "") {
      setTurn(player === "X" ? "O" : "X");

      await channel.sendEvent({
        type: "game-move",
        data: { square, player },
      });
      setBoard(
        board.map((val, idx) => {
          if (idx === square && val === "") {
            return player;
          }
          return val;
        })
      );
    }
  };

  const checkWin = () => {
    Patterns.forEach((currPattern) => {
      const firstPlayer = board[currPattern[0]];
      if (firstPlayer == "") return;
      let foundWinningPattern = true;
      currPattern.forEach((idx) => {
        if (board[idx] != firstPlayer) {
          foundWinningPattern = false;
        }
      });

      if (foundWinningPattern) {
        setResult({ winner: board[currPattern[0]], state: "won" });
      }
    });
  };

  const checkIfTie = () => {
    let filled = true;
    board.forEach((square) => {
      if (square == "") {
        filled = false;
      }
    });

    if (filled) {
      setResult({ winner: "none", state: "tie" });
    }
  };

  return (
    <div className="board">
      <div className="row">
        <Square val={board[0]} chooseSquare={() => chooseSquare(0)} />
        <Square val={board[1]} chooseSquare={() => chooseSquare(1)} />
        <Square val={board[2]} chooseSquare={() => chooseSquare(2)} />
      </div>
      <div className="row">
        <Square val={board[3]} chooseSquare={() => chooseSquare(3)} />
        <Square val={board[4]} chooseSquare={() => chooseSquare(4)} />
        <Square val={board[5]} chooseSquare={() => chooseSquare(5)} />
      </div>
      <div className="row">
        <Square val={board[6]} chooseSquare={() => chooseSquare(6)} />
        <Square val={board[7]} chooseSquare={() => chooseSquare(7)} />
        <Square val={board[8]} chooseSquare={() => chooseSquare(8)} />
      </div>
    </div>
  );
}

export default Board;