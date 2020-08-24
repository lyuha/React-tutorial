import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

enum GameStatus {
  O = 'O',
  X = 'X',
  Draw = 'DRAW',
  Running = 'RUNNING',
}

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const boardSize = 3

    const board = [...Array(3)].map((_, i) => {
      const row = [...Array(boardSize)].map((_, j) => this.renderSquare(i * boardSize + j));

      return (
        <div className="board-row" key={i}>
          {row}
        </div>
      );
    });

    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscendingOrder: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const gameStatus = calculateGameStatus(squares);

    if (gameStatus === GameStatus.O || gameStatus == GameStatus.X || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reverseHistory() {
    this.setState({
      isAscendingOrder: !this.state.isAscendingOrder,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const unorderedMove = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const moves = this.state.isAscendingOrder ? unorderedMove : unorderedMove.reverse();

    const gameStatus = calculateGameStatus(current.squares);

    let status: string;
    switch (gameStatus) {
      case GameStatus.O: {
        status = 'Winner: O';
        break;
      }
      case GameStatus.X: {
        status = 'Winner: X';
        break;
      }
      case GameStatus.Running: {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        break;
      }
      case GameStatus.Draw: {
        status = "Draw Game!"
        break;
      }
      default: {
        break;
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => { this.reverseHistory() }}>Reverse history</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// ========================================

function calculateGameStatus(squares): GameStatus {
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

  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  for (const square of squares) {
    if (square === null) {
      return GameStatus.Running;
    }
  }

  return GameStatus.Draw;
}
