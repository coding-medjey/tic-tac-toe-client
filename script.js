// const url = "http://localhost:3000";
const url = "https://tic-tac-toe-ws-zmkv.onrender.com"
const socket = io(url, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

let lastMoveSymbol = "O";
let currentPlayer;
let playerJoined = false;

const gameState = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

socket.on("connect", () => {
  console.log("Connected to server with socket ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Connection Error:", error);
});

const handleGame = (id) => {
  const option = window.prompt("1. Start Game \n2. Join Game");
  const roomId =
    option === "1"
      ? id.toString()
      : option === "2"
      ? window.prompt("Enter your room id").trim()
      : "";
  return [roomId.toString(), Number(option)];
};

const startGame = (roomId) => {
  socket.emit("start-game", roomId);
  window.alert(`Room id ${roomId} created`);
};

const joinGame = (roomId) => {
  socket.emit("join-game", roomId);
};

socket.on("player-2-joined", () => {
  console.log("Second player has joined the game");
  window.alert("Second player joined!");
  playerJoined = true;
});

socket.on("room-full", (msg) => {
  window.alert(msg);
  window.location.reload();
});

socket.on("board-update", (data) => {
  const { row, col, symbol } = data;
  lastMoveSymbol = symbol;
  const cell = document.getElementById(`${row}-${col}`);
  if (!gameState[row][col]) renderMove(cell, symbol);
  gameState[row][col] = symbol;
});

socket.on("game-over", (winningMsg) => {
  window.alert(winningMsg);
  removeEventListeners();
  if (window.confirm("Do you want to play another game?")) {
    window.location.reload();
  }
});

const id = crypto.randomUUID();
const [roomId, option] = handleGame(id);

if (option === 1) {
  startGame(roomId);
  currentPlayer = "X";
} else {
  joinGame(roomId);
  currentPlayer = "O";
}

function createBoard() {
  const board = document.querySelector(".board");
  for (let i = 0; i < 3; i++) {
    const row = document.createElement("div");
    row.classList.add(`row-${i}`);
    for (let j = 0; j < 3; j++) {
      const col = document.createElement("button");
      col.classList.add("cell");
      col.setAttribute("id", `${i}-${j}`);
      col.setAttribute("data-row", i);
      col.setAttribute("data-col", j);
      row.appendChild(col);
    }
    board.appendChild(row);
  }

  handleMoves();
}

function handleClick(e) {
  if (!playerJoined) {
    alert("Wait for the other player");
    return;
  }
  if (lastMoveSymbol === currentPlayer) {
    alert("Wait for other player to move");
    return;
  }

  const cell = e.target;
  const row = parseInt(cell.getAttribute("data-row"));
  const col = parseInt(cell.getAttribute("data-col"));

  if (gameState[row][col] !== "") {
    return;
  }

  gameState[row][col] = currentPlayer;
  renderMove(cell, currentPlayer);

  socket.emit("move", {
    symbol: currentPlayer,
    roomId: roomId,
    col: col,
    row: row,
  });

  if (chooseWinner(gameState, currentPlayer)) {
    removeEventListeners();
    const winningMsg = `${currentPlayer} Wins`;
    socket.emit("game-over", { roomId: roomId, winningMsg });
  } else if (isDraw(gameState)) {
    const bothPlayers = currentPlayer === "X" ? "X and O" : "O and X";
    const winningMsg = `Match is Draw by ${bothPlayers}`;
    socket.emit("game-over", { roomId: roomId, winningMsg });
  }
}

function renderMove(cell, player) {
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;
}

function handleMoves() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => cell.addEventListener("click", handleClick));
}

function removeEventListeners() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => cell.removeEventListener("click", handleClick));
}

function isDraw(board) {
  return board.every((row) => row.every((cell) => cell !== ""));
}

function chooseWinner(board, currentPlayer) {

  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] === currentPlayer &&
      board[i][1] === currentPlayer &&
      board[i][2] === currentPlayer
    ) {
      return true;
    }
  }

  // Check columns
  for (let j = 0; j < 3; j++) {
    if (
      board[0][j] === currentPlayer &&
      board[1][j] === currentPlayer &&
      board[2][j] === currentPlayer
    ) {
      return true;
    }
  }

  // Check diagonals
  if (
    board[0][0] === currentPlayer &&
    board[1][1] === currentPlayer &&
    board[2][2] === currentPlayer
  ) {
    return true;
  }

  if (
    board[0][2] === currentPlayer &&
    board[1][1] === currentPlayer &&
    board[2][0] === currentPlayer
  ) {
    return true;
  }

  return false;
}

createBoard();
