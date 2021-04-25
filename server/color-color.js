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
    toString: () => 'host',
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

  const { ghostColor, ghostCoords } = topRight(board);
  const ghostSquares = initialSquare(ghostCoords);
  const ghostChallenger = createPlayer({ ghostColor, ghostSquares });

  console.log(host.color);

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
  console.log(cookie.face);
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
  console.log('yo');
  return find((game) => {
    console.log(game);
    return game.challenger.id === undefined;
  });
}

function showGames() {
  console.log(find(() => true, -1));
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
};
