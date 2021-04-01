const express = require('express');
const socket = require('socket.io')();
const bodyParser = require('body-parser');
const path = require('path');
const idGen = require('./server/common/id');
const { unpack, pack } = require('./server/packer');
const cc = require('./server/color-color');

const app = express();

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
    res.locals.cookie[key] = value;
  });

  res.locals.setCookie = (entries) => {
    Object.entries(entries).forEach(([name, value]) => {
      res.locals.cookie[name] = value;
      res.cookie(name, value, { maxAge: 9000000000 });
    });
  };
  next();
});

app.use(express.static(publicPath));

app.get('/', function (req, res) {
  const playerId = res.locals.cookie.playerId;
  if (playerId === undefined)
    res.cookie('playerId', Math.random().toString().substr(2, 6), { maxAge: 10800, httpOnly: false });
  console.log(playerId);
  res.sendFile(path.join(publicPath, 'index.html'));
});

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
  // const game = cc.getGameOf(cookie);
  const game = cc.createGame(data, cookie);
  return game;
});

client('create-game', ({ data, cookie }) => {
  if (cc.inGame(cookie)) {
    return;
  }

  const game = cc.createGame(data, cookie);

  return game;
});

client('join', ({ gameId, cookie }) => {
  return cc.joinGame(gameId, cookie);
});

app.listen(2500);
