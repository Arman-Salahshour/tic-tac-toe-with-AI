const Player = function (name, number) {
  this.name = name;
  this.number = number;
  this.set_score = document.querySelector(`#current--${number}`);
  this.current_score = () => this.set_score.textContent;
  this.score = this.current_score();
};

let turn = 1;
let playing = true;
const game = document.querySelector(".board");
let board = [
  Array.from({ length: 3 }),
  Array.from({ length: 3 }),
  Array.from({ length: 3 }),
];
const header = document.querySelector(".board__round");
const items = document.querySelectorAll(".board__main--item");
const players = [new Player("Arman", 1), new Player("AI", 2)];
const reset_button = document.querySelector(".btn__reset");
const next_button = document.querySelector(".btn__next");
const sign1 = "player-1--sign";
const sign2 = "player-2--sign";
const board_object = document.querySelector(".board__main");
const labels = document.querySelectorAll(".current-label");

//Initialize the game
const init = function () {
  playing = true;
  game.classList.add("player-1--active");
  game.classList.remove("player-2--active");
  labels.forEach(function (label, num) {
    label.textContent = players[num].name;
  });

  //Initialize the turn
  turn = 1;

  //Remove all sign from the board
  items.forEach(function (item, num) {
    item.setAttribute("data-num", num);
    item.querySelector(".player--sign").classList.remove("player-1--sign");
    item.querySelector(".player--sign").classList.remove("player-2--sign");
    //empty board
    const row = Math.trunc(num / 3);
    const col = Math.trunc(num % 3);
    board[row][col] = false;
  });

  //initialize score with 0
  players.forEach(function (player) {
    player.set_score.textContent = 0;
  });

  //initialize the header
  header.textContent = players[0].name;
};
init();

//Add event addEventListener when user clicks on the item
board_object.addEventListener("click", function (e) {
  if (playing === true) {
    if (e.target.classList.contains("board__main--item")) {
      const item = e.target;
      const sign = item.querySelector(".player--sign");
      if (
        !sign.classList.contains("player-1--sign") &&
        !sign.classList.contains("player-2--sign")
      ) {
        if (turn === 1) {
          e.target
            .querySelector(".player--sign")
            .classList.add("player-1--sign");

          //Item will be True when it's clicked
          const row = Math.trunc(e.target.dataset.num / 3);
          const col = Math.trunc(e.target.dataset.num % 3);
          board[row][col] = "x";

          //Check the board for user
          if (check_board(board, "x") === true) {
            winner(players[0]);
            playing = false;
            return;
          } else if (check_board(board, "x") == "equal") {
            equality();
            playing = false;
            return;
          }
          turn = 2;
          playing = false;
        }

        //AI choose the best item
        if (turn === 2 && playing === false) {
          game.classList.remove("player-1--active");
          game.classList.add("player-2--active");
          header.textContent = players[1].name;
          setTimeout(AI_select, 1500);
        }
      }
    }
  }
});

const AI_select = function () {
  game.classList.remove("player-2--active");
  game.classList.add("player-1--active");
  header.textContent = players[0].name;
  turn = 1;
  playing = true;

  //DFS algorithm help AI to chose the best cordinate

  const temp_board = DFS(board, "max").child;
  board = temp_board.child;
  board_object
    .querySelector(`#num-${temp_board.row * 3 + temp_board.col}`)
    .classList.add("player-2--sign");

  //Check the board for AI
  if (check_board(board, "o") === true) {
    winner(players[1]);
    playing = false;
    return;
  } else if (check_board(board, "o") == "equal") {
    equality();
    playing = false;
    return;
  }
};

//Change the background for winner
const winner = function (player) {
  header.textContent = `${player.name} is winner`;
  player.score = Number(player.current_score()) + 1;
  player.set_score.textContent = player.score;
  game.classList.remove("player-1--active");
  game.classList.remove("player-2--active");
  // game.classList.add("winner--active");
};

const equality = function () {
  header.textContent = `Equal`;
  game.classList.remove("player-1--active");
  game.classList.remove("player-2--active");
};

const check_board = function (board, sign) {
  //Check the rows
  let equal = true;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] !== sign) {
        equal = false;
        break;
      }
    }
    if (equal === true) {
      return true;
    } else {
      equal = true;
    }
  }

  //Check the columns
  equal = true;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[j][i] !== sign) {
        equal = false;
        break;
      }
    }
    if (equal === true) {
      return true;
    } else {
      equal = true;
    }
  }

  //Check the original diagonal
  equal = true;
  for (let i = 0; i < board.length; i++) {
    if (board[i][i] !== sign) {
      equal = false;
      break;
    }
  }

  if (equal === true) {
    return true;
  }

  //Check the sub-diagonal
  equal = true;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (i + j === 2) {
        if (board[i][j] !== sign) {
          equal = false;
        }
      }
    }
  }

  if (equal === true) {
    return true;
  } else if (!board.flat().includes(false)) {
    return "equal";
  } else {
    return false;
  }
};

//Reset game
reset_button.addEventListener("click", function () {
  init();
  players.forEach(function (player) {
    player.set_score.textContent = 0;
    player.score = player.current_score();
  });
});

//Save score and reset the board
next_button.addEventListener("click", function () {
  init();
  players.forEach(function (player) {
    player.set_score.textContent = player.score;
  });
});

const create_children = function (board, sign) {
  const children = [];

  //deep copy from board
  board = JSON.parse(JSON.stringify(board));

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] === false) {
        board[i][j] = sign;
        children.push({ child: board, row: i, col: j });
        board = JSON.parse(JSON.stringify(board));
        board[i][j] = false;
      }
    }
  }

  return children;
};

//DFS algorithm when AI is playing the game
const DFS = function (parent, mode) {
  let sign = "";
  let target = "";
  if (mode === "max") {
    sign = "o";
    target = {
      child: "",
      score: -Infinity,
    };
  } else if (mode === "min") {
    sign = "x";
    target = {
      child: "",
      score: Infinity,
    };
  }
  const children = create_children(parent, sign);

  for (let i = 0; i < children.length; i++) {
    if (check_board(children[i].child, "x") === true) {
      target.child = children[i];
      target.score = -1;
      return target;
    }
    if (check_board(children[i].child, "o") === true) {
      target.child = children[i];
      target.score = 1;
      return target;
    }
    if (check_board(children[i].child, "o") === "equal") {
      target.child = children[i];
      target.score = 0;
      return target;
    }

    if (mode === "max") {
      let final_target = DFS(children[i].child, "min");
      if (target.score < final_target.score) {
        target.score = final_target.score;
        target.child = children[i];
      }
    }
    if (mode === "min") {
      let final_target = DFS(children[i].child, "max");
      if (target.score > final_target.score) {
        target.score = final_target.score;
        target.child = children[i];
      }
    }
  }
  return target;
};
