const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { unpack, pack } = require('./packer');
const app = express();

const publicPath = path.join(__dirname, '../client/build');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.is('application/json')) res.locals.data = unpack(req.body);
  res.locals.send = (data) => res.send(pack(data));
  res.locals.send.status = (statusCode) => res.sendStatus(statusCode);
  next();
});
app.use((req, res, next) => {
  const cookieList = req.headers.cookie.split('; ');
  res.locals.cookie = {};
  cookieList.forEach((item) => {
    const [key, value] = item.split('=');
    res.locals.cookie[key] = value;
  });
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

const games = {
  all: [],
  open: [],
  full: [],
  create: () => {},
  destroy: () => {},
  challenge: () => {},
  reconnect: () => {},
};

function client(command, action) {
  app.post(`/color-color/${command}`, (req, res, next) => {
    const { data, send, cookie } = res.locals;
    action(data, send, cookie, req, res, next);

    if (res.headersSent === false) send();
  });
}

client('index', (data, send, cookie) => {
  let resObject = {};

  const playerId = cookie.id;
  if (playerId === undefined) resObject.id = Math.random().toString().substr(2, 5);
  else {
    resObject.inGame = false;
  }
  send(resObject);
});

app.listen(2500);
