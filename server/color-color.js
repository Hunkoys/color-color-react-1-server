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
  return board.table[0][board.size.w - 1];
}

function bottomLeft(board) {
  return board.table[board.size.h - 1][0];
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
  const host = createPlayer(cookie);
  const ghostChallenger = createPlayer({ color: topRight(board) });
  host.color = bottomLeft(board);
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
    const challenger = createPlayer(cookie);
    challenger.color = topRight(game.board);
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
