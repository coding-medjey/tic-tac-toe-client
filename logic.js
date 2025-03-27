function chooseWinner(board, player) {
  return (
    checkCols(player, board) ||
    checkRows(player, board) ||
    checkDiagnol(board, player)
  );
}

function checkRows(board, player) {
  for (let i = 0; i < board.length; i++) {
    if (
      board[i][0] === player &&
      board[i][1] === player &&
      board[i][2] === player
    )
      return true;
  }
  return false;
}

function checkCols(board, player) {
  for (let i = 0; i < board.length; i++) {
    if (
      board[0][i] === player &&
      board[1][i] === player &&
      board[2][i] === player
    )
      return true;
  }
  return false;
}

function checkDiagnol(board, player) {
  return checkDiagnolA(board, player) || checkDiagnolB(board, player);
}

function checkDiagnolA(board, player) {
  if (
    board[0][0] === player &&
    board[1][1] === player &&
    board[2][2] === player
  ) {
    return true;
  }
  return false;
}

function checkDiagnolB(board, player) {
  if (
    board[0][2] === player &&
    board[1][1] === player &&
    board[2][0] === player
  ) {
    return true;
  }
  return false;
}

const isDraw = (board) => {
  console.log("Inside the isdraw");
  for (let row of board) {
    for (let move of row) {
      if (!move) {
        return false;
      }
    }
  }
  return true;
};
