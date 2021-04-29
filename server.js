const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const idGen = require('./server/common/id');
const { unpack, pack } = require('./server/packer');
const cc = require('./server/color-color');
const { roles } = require('./server/color-color');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

const publicPath = path.join(__dirname, '../client/build');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.is('application/json')) res.locals.data = unpack(req.body);
  res.locals.send = (data) => res.send(pack(data));
  res.locals.send.status = (statusCode) => res.sendStatus(statusCode);
  res.locals.send.error = (message) => {
    res.sendStatus(500);
  };
  next();
});
app.use((req, res, next) => {
  const cookieList = req.headers.cookie ? req.headers.cookie.split('; ') : [];
  res.locals.cookie = {};
  cookieList.forEach((item) => {
    const [key, value] = item.split('=');
    res.locals.cookie[key] = unpack(value);
  });

  res.locals.setCookie = (entries) => {
    Object.entries(entries).forEach(([name, rawValue]) => {
      const value = pack(rawValue);
      res.locals.cookie[name] = value;
      res.cookie(name, value, { maxAge: 9000000000, encode: String });
    });
  };
  next();
});

app.use(express.static(publicPath));

// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });

io.on('connection', (socket) => {
  socket.emit('whats your id');
  socket.on('give id', (id) => {
    if (id) {
      const game = cc.getGameOf({ id });
      if (game === undefined) return; // Game not found. back to splash

      const room = game.id;
      socket.join(room);
      socket.to(room).emit('player-joined', game);

      socket.on('move', (move) => {
        const [player, type, data] = unpack(move);
        const CROSS = [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ];

        const game = cc.getGameOf(player);

        if (player.id == game.turn.id) {
          if (type === 'confirm') {
            const [color] = data;

            colorize(player, color);

            consume(player, 1);

            game.turn = player.id == game.host.id ? game.challenger : game.host;
            // console.log(game.board.table);
          }

          socket.to(room).emit('move', move);
        }

        function colorize(player, color) {
          const me = is(player, game.host) ? game.host : game.challenger;
          me.color = color;

          me.squares.all.forEach(([x, y]) => {
            const row = game.board.table[y];
            if (row != undefined) row[x] = color;
          });
        }

        function consume(player, range) {
          const [me, enemy] = is(player, game.host) ? [game.host, game.challenger] : [game.challenger, game.host];
          const mySquares = me.squares.all;
          const enemySquares = enemy.squares.all;
          const pending = [];

          const edges = me.squares.edges;

          const newEdges = edges.filter((edge) => {
            let isEdge = false;

            CROSS.forEach((offset) => {
              const side = getRelativeSquare(edge, offset);
              const color = getColor(side);

              if (color === undefined) return;
              if (isFree(side)) {
                const myColor = getColor(edge);
                if (color === myColor) collectSquare(side);
                else isEdge = true;
              }
            });

            return isEdge;
          });

          pending.forEach((square) => {
            const isEdge = CROSS.some((offset) => {
              const side = getRelativeSquare(square, offset);
              const color = getColor(side);
              if (color != undefined && isFree(side)) return true;
              else return false;
            });

            if (isEdge) newEdges.push(square);
          });

          me.squares.edges = newEdges;

          function collectSquare(square) {
            mySquares.push(square);
            pending.push(square);
          }

          function isFree(square) {
            function notIn(list) {
              return !list.some((inQuestion) => square[0] === inQuestion[0] && square[1] === inQuestion[1]);
            }

            return notIn(mySquares) && notIn(enemySquares);
          }

          function getColor([x, y]) {
            const row = game.board.table[y];
            return row ? row[x] : undefined;
          }

          function getRelativeSquare(coords, offset) {
            return [coords[0] + offset[0], coords[1] + offset[1]];
          }
        }
      });
    } else console.log('Player Doesnt have ID');
  });
});

app.get('/', function (req, res) {
  // const playerId = res.locals.cookie.playerId;
  // if (playerId === undefined) res.cookie('playerId', idGen.create(6), { maxAge: 10800, httpOnly: false });
  res.sendFile(path.join(publicPath, 'index.html'));
});

function is(obj1, obj2) {
  return obj1.id == obj2.id;
}

function client(command, action) {
  app.post(`/color-color/${command}`, (req, res, next) => {
    const { data, send, cookie, setCookie } = res.locals;
    const playerHasId = cookie.id !== undefined;
    if (!playerHasId) setCookie({ id: idGen.create(6) });
    const response = action({ data, send, cookie, req, res, next });

    if (res.headersSent === false) send(response);
  });
}

client('index', ({ data, cookie }) => {
  const game = cc.getGameOf(cookie);
  // const game = cc.createGame(data, cookie);
  return game;
});

client('create-game', ({ data, cookie }) => {
  if (cc.inGame(cookie)) {
    return;
  }

  const game = cc.createGame(data, cookie);

  return game;
});

client('quit-game', ({ cookie }) => {
  cc.destroyGame(cookie); // Bad implementation. put role checking here
  return true;
});

client('join-game', ({ data, cookie }) => {
  return cc.joinGame(data, cookie);
});

client('get-open-games', () => {
  return cc.getOpenGames();
});

server.listen(2500);
