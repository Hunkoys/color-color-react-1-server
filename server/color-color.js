const idGen = require('./common/id');
const db = require('./color-color/database');
const generateBoard = require('./color-color/Board');

const ColorColor = {
  open: [],
  full: [],
  create: ({ host, board }) => {
    const game = {
      host,
      challenger: undefined,
    };
  },
  destroy: () => {},
  challenge: () => {},
  reconnect: () => {},
};

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

function createGame(config) {
  const game = {
    id: idGen.create(5),
    host: undefined,
    challenger: undefined,
    board: generateBoard(config.board),
  };

  add(game);

  return game;
}

function createPlayer(cookie) {
  return {
    id: cookie.id,
    username: cookie.username,
  };
}

function wtf(cookie) {
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
  const { role } = wtf(cookie);
  return role;
}

function inGame(cookie) {
  if (role(cookie)) return true;
  else return false;
}

function getGame(cookie) {
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
  createPlayer,
  role,
  inGame,
  getGame,
};
