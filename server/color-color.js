const idGen = require('./common/id');
const db = require('./color-color/database');
const generateBoard = require('./color-color/Board');

// const ColorColor = {
//   open: [],
//   full: [],
//   create: ({ host, board }) => {
//     const game = {
//       host,
//       challenger: undefined,
//     };
//   },
//   destroy: () => {},
//   challenge: () => {},
//   reconnect: () => {},
// };

const TOP = [0, -1];
const RIGHT = [1, 0];
const BOTTOM = [0, 1];
const LEFT = [-1, 0];
const CROSS = [TOP, RIGHT, BOTTOM, LEFT];

function topRight(board) {
  const x = board.size.w - 1;
  const y = 0;

  const coords = [x, y];
  const color = board.table[y][x];
  return { coords, color };
}

function bottomLeft(board) {
  const x = 0;
  const y = board.size.h - 1;

  const coords = [x, y];
  const color = board.table[y][x];
  return { coords, color };
}

function initialSquare(square) {
  return {
    all: [square],
    edges: [square],
  };
}

const roles = {
  host: {
    toString: () => 'host', // Bad Idea for apps running in different memories
  },
  challenger: {
    toString: () => 'challenger',
  },
  spectator: {
    toString: () => 'spectator',
  },
};

const games = 'games';
db.create(games);

function add(game) {
  db.add(games, game);
}

function remove(game) {
  db.remove(games, game);
}

function find(checker, count) {
  return db.find(games, checker, count);
}

function createGame(config, cookie) {
  const board = generateBoard(config.board);

  const { color, coords } = bottomLeft(board);
  const squares = initialSquare(coords);
  const host = createPlayer({ ...cookie, color, squares });

  const { color: ghostColor, squares: ghostCoords } = topRight(board);
  console.log(ghostColor, ghostCoords);
  const ghostSquares = initialSquare(ghostCoords);
  const ghostChallenger = createPlayer({ color: ghostColor, squares: ghostSquares });

  const game = {
    id: idGen.create(5),
    host,
    challenger: ghostChallenger,
    board,
    turn: undefined,
  };

  add(game);

  return game;
}

function joinGame(gameId, cookie) {
  const game = getGame(gameId);
  if (game) {
    const { color, coords } = topRight(game.board);
    const squares = initialSquare(coords);
    const challenger = createPlayer({ ...cookie, color, squares });
    game.challenger = challenger;
    game.turn = challenger;
    return game;
  } else return;
}

function destroyGame(cookie) {
  const { game, role } = getGameVerbose(cookie);
  if (role === roles.host) {
    // tell challenger that host quit
    remove(game);
  } else if (role === roles.challenger) {
    // Leave the game open
  }
}

function createPlayer(cookie) {
  return {
    id: cookie.id,
    username: cookie.username,
    faceName: cookie.faceName,
    color: cookie.color,
    squares: cookie.squares,
  };
}

function getGameVerbose(cookie) {
  let role;
  const results = find((game) => {
    return Object.keys(roles).some((roleName) => {
      if (game[roleName] && game[roleName].id == cookie.id) {
        role = roles[roleName];
        return true;
      } else return false;
    });
  });

  return {
    game: results.length > 0 ? results[0] : undefined,
    role,
  };
}

function role(cookie) {
  const { role } = getGameVerbose(cookie);
  return role;
}

function inGame(cookie) {
  if (role(cookie)) return true;
  else return false;
}

function getGame(gameId) {
  const results = find((game) => game.id == gameId);

  return results.length > 0 ? results[0] : undefined;
}

function getGameOf(cookie) {
  const results = find((game) => {
    return Object.keys(roles).some((roleName) => game[roleName] && game[roleName].id == cookie.id);
  });

  return results.length > 0 ? results[0] : undefined;
}

function getOpenGames() {
  return find((game) => {
    return game.challenger.id === undefined;
  });
}

function showGames() {
  console.log(find(() => true, -1));
}

function consume(player, range) {
  const game = getGameOf(player);

  const enemy = is(player, game.host) ? game.challenger : game.host;
  const mySquares = player.squares.all;
  const enemySquares = enemy.squares.all;

  function isFree(square) {
    const notIn = (list) => !logic.searchIn(list, square);
    return notIn(mySquares) || notIn(enemySquares);
  }

  function getColor(square, offset) {
    return logic.getColor(game.board, square, offset);
  }

  function collectSquare(square) {
    mySquares.push(square);
  }

  const edges = player.squares.edges;

  const newEdges = edges.filter((edge) => {
    let isEdge = false;

    CROSS.forEach((side) => {
      if (isFree(side)) {
        const myColor = getColor(edge);
        const color = getColor(edge, side);
        if (color === myColor) collectSquare(side);
        else isEdge = true;
      }
    });

    return isEdge;
  });

  return game;
}

module.exports = {
  roles,
  get games() {
    return db.get(games);
  },
  createGame,
  joinGame,
  destroyGame,
  createPlayer,
  role,
  inGame,
  getGame,
  getGameOf,
  getOpenGames,
  showGames,
  consume,
};
