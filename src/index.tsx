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
  if (props.highlight) {
    return (
      <button className="square" onClick={props.onClick} style={{ backgroundColor: "#FF0000" }}>
        {props.value}
      </button>
    );
  } else {
    return (
      <button className="square" onClick={props.onClick} >
        {props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i, highlight: boolean) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={highlight}
      />
    );
  }

  render() {
    const boardSize = 3
    const line = this.props.line;

    const board = [...Array(3)].map((_, i) => {
      const row = [...Array(boardSize)].map((_, j) => {
        let index = i * boardSize + j;

        return this.renderSquare(index, line.includes(index));
      });

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
        move: [],
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

    const row = Math.floor(i / 3);
    const col = i % 3;

    this.setState({
      history: history.concat([{
        squares: squares,
        move: [row, col],
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
      const isCurrentStep = (move === this.state.stepNumber);
      const [row, col] = step.move;
      const desc = move ?
        'Go to move #' + move + ` (${row}, ${col})` :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} style={isCurrentStep ? { backgroundColor: '#FFFF00' } : null}>{desc}</button>
        </li>
      );
    });

    const moves = this.state.isAscendingOrder ? unorderedMove : unorderedMove.reverse();

    const [gameStatus, highlightedLine] = calculateGameStatus(current.squares);

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
            line={highlightedLine}
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

function calculateGameStatus(squares): [GameStatus, [number]] {
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
      return [squares[a], line];
    }
  }

  for (const square of squares) {
    if (square === null) {
      return [GameStatus.Running, []];
    }
  }

  return [GameStatus.Draw, []];
}
