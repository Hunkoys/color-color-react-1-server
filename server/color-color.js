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

const roles = ['host', 'challenge', 'spectator'];

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
  host.color = bottomLeft(board);
  console.log(host.color);

  const game = {
    id: idGen.create(5),
    host,
    challenger: undefined,
    board,
    turn: undefined,
  };

  add(game);

  return game;
}

function joinGame(gameId, cookie) {
  const game = cc.getGame(gameId);
  if (game) {
    const challenger = cc.createPlayer(cookie);
    challenger.color = topRight(game.board);
    game.challenger = challenger;
    game.turn = challenger;
    return game;
  } else return;
}

function createPlayer(cookie) {
  return {
    id: cookie.id,
    username: cookie.username,
    color: undefined,
  };
}

function getGameVerbose(cookie) {
  let role;
  const results = find((game) => {
    return roles.some((roleName) => {
      if (game[roleName] && game[roleName].id === cookie.id) {
        role = roleName;
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
  const results = find((game) => game.id === gameId);

  return results.length > 0 ? results[0] : undefined;
}

function getGameOf(cookie) {
  const results = find((game) => {
    return roles.some((roleName) => game[roleName] && game[roleName].id === cookie.id);
  });

  return results.length > 0 ? results[0] : undefined;
}

module.exports = {
  get games() {
    return db.get(games);
  },
  createGame,
  joinGame,
  createPlayer,
  role,
  inGame,
  getGame,
  getGameOf,
};
