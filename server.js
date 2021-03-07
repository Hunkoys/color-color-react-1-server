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

const openGames = {
  list: [
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
  ],
};

app.get('/api/data', (req, res) => {
  res.send(pack(openGames));
});

app.post('/api/join', (req, res) => {
  const gameId = unpack(req.body);
  console.log(`Joining: ${gameId}`);

  res.send();
});

app.listen(2500);
