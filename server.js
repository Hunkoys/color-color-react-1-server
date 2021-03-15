const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { unpack, pack } = require('./packer');
const app = express();

const public = path.join(__dirname, '../client/build');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(public));

app.get('/ping', function (req, res) {
  return res.send('pong');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(public, 'index.html'));
});

const openGames = [
  {
    id: 'skaj1',
    name: 'Maria',
    boardSize: {
      w: 15,
      h: 15,
    },
  },
  {
    id: 'hueq2',
    name: 'John',
    boardSize: {
      w: 7,
      h: 7,
    },
  },
  {
    id: 'uihowr3',
    name: 'Tanglo',
    boardSize: {
      w: 15,
      h: 15,
    },
  },
  {
    id: '263hed4',
    name: 'Brogodog',
    boardSize: {
      w: 21,
      h: 21,
    },
  },
];

function createGame(details) {
  details.id = 'hasd';
  openGames.push(details);
}

app.post('/api/create-game', (req, res) => {
  const details = unpack(req.body);
  createGame(details);
  console.log(details);
  res.send();
});

app.get('/api/open-games', (req, res) => {
  res.send(pack(openGames));
});

app.post('/api/join', (req, res) => {
  const gameId = unpack(req.body);
  console.log(`Joining: ${gameId}`);

  res.send();
});

let bro;
app.post('/bro', (req, res) => {
  bro = unpack(req.body);
  res.send();
});
app.get('/bro', (req, res) => {
  res.send(pack(bro));
});

app.listen(2500);
