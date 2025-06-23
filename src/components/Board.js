import React, { useState, useEffect, useRef } from 'react';
import Square from './Square';
import './Board.css';

function Board() {
  // State to keep track of the board squares
  const [squares, setSquares] = useState(Array(9).fill(null));
  // State to track if it's X's turn
  const [isXNext, setIsXNext] = useState(true);
  // State to track if the game is over
  const [gameOver, setGameOver] = useState(false);
  // State to store the results of each game
  const [results, setResults] = useState([]);
  // State to keep track of the player (assumed to be 'X' initially)
  const [player, setPlayer] = useState('X');
  // Ref to store the timeout id for the computer's move
  const computerMoveTimeout = useRef(null);

  // Effect to handle the computer's move
  useEffect(() => {
    // If it's the computer's turn and the game is not over
    if (!isXNext && !gameOver) {
      // Get the best move for the computer
      const bestMove = getBestMove(squares, player === 'X' ? 'O' : 'X');
      if (bestMove !== null) {
        // Make the move after a short delay and store the timeout id
        computerMoveTimeout.current = setTimeout(() => handleClick(bestMove, false), 500);
      }
    }
    // Clear any pending timeouts when dependencies change
    return () => {
      if (computerMoveTimeout.current) {
        clearTimeout(computerMoveTimeout.current);
        computerMoveTimeout.current = null;
      }
    };
  }, [isXNext, gameOver, squares, player]);

  // Function to handle a square being clicked
  const handleClick = (index, isPlayerMove = true) => {
    const newSquares = squares.slice();
    // If the game is over or the square is already filled, return
    if (calculateWinner(squares) || squares[index] || gameOver) {
      return;
    }
    // Set the square to the current player's symbol
    newSquares[index] = isPlayerMove ? player : (player === 'X' ? 'O' : 'X');
    setSquares(newSquares);
    // Toggle the turn
    setIsXNext(isPlayerMove ? false : true);
    // Check if there's a winner
    const winner = calculateWinner(newSquares);
    if (winner || !newSquares.includes(null)) {
      // If there's a winner or the board is full, end the game
      setGameOver(true);
      // Update the results with the game outcome
      setResults([...results, {
        winner: winner ? winner : 'Draw',
        player,
        computer: player === 'X' ? 'O' : 'X'
      }]);
    }
  };

  // Function to render a square
  const renderSquare = (index) => {
    return (
      <Square
        value={squares[index]}
        onClick={() => handleClick(index)}
      />
    );
  };

  // Determine the game status message
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner === player ? 'You' : 'Computer'}`;
  } else if (!squares.includes(null)) {
    status = 'Draw';
  } else {
    status = `Next player: ${isXNext ? player : (player === 'X' ? 'O' : 'X')}`;
  }

  // Function to reset the game
  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    if (computerMoveTimeout.current) {
      clearTimeout(computerMoveTimeout.current);
      computerMoveTimeout.current = null;
    }
  };

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      <button className="button" onClick={resetGame}>Reset</button>
      {gameOver && <button className="button" onClick={resetGame}>Play Again</button>}
      {results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>You</th>
              <th>Computer</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{result.winner === result.player ? 'Win' : (result.winner === 'Draw' ? 'Draw' : 'Lose')}</td>
                <td>{result.winner === result.computer ? 'Win' : (result.winner === 'Draw' ? 'Draw' : 'Lose')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Function to determine the winner of the game
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// Function to determine the best move for the computer using the Minimax algorithm
function getBestMove(squares, computer) {
  const player = computer === 'X' ? 'O' : 'X';

  function minimax(squares, depth, isMaximizing) {
    const winner = calculateWinner(squares);
    if (winner === computer) return 10 - depth;
    if (winner === player) return depth - 10;
    if (!squares.includes(null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = computer;
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = player;
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  let bestMove = null;
  let bestScore = -Infinity;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      squares[i] = computer;
      const score = minimax(squares, 0, false);
      squares[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export default Board;
