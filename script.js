// const url = "https://tic-tac-toe-ws-zmkv.onrender.com";
const url = "http://localhost:3000";
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
  document.getElementById("winner").textContent = winningMsg;
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
  console.log(
    "choose-winner",
    chooseWinner(gameState, currentPlayer),
  );

  console.log("Is Draw");

  if (chooseWinner(gameState, currentPlayer)) {
    removeEventListeners();
    const winningMsg = `${currentPlayer} Wins`;
    socket.emit("game-over", { roomId: roomId, winningMsg });
  } else if (isDraw(gameState)) {
    alert("Match is Draw");
  }

  console.log("move event", {
    symbol: currentPlayer,
    roomId: roomId,
    col: col,
    row: row,
  });
  socket.emit("move", {
    symbol: currentPlayer,
    roomId: roomId,
    col: col,
    row: row,
  });
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

createBoard();
