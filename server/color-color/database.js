const storage = {};

// Table //
function create(name) {
  if (storage[name]) console.error(`Database.${create.name}: table already exists`);
  else storage[name] = [];
}

function deleteTable(name) {
  delete storage[name];
}

function getTable(name) {
  const table = storage[name] instanceof Array ? storage[name] : undefined;
  if (table === undefined) console.error(`Database.${getTable.name}: table(${name}) does not exist`);
  return table;
}
// < Table //

// Item //
function add(tableName, item) {
  const table = getTable(tableName);
  if (table == undefined) return;

  if (table.includes(item)) console.error(`Database.${add.name}: item already in table: ${tableName}, item: ${item}`);
  else storage[tableName].push(item);
}

function remove(tableName, item) {
  const table = getTable(tableName);
  if (table == undefined) return;

  const index = table.indexOf(item);
  if (index === -1) console.error(`Database${remove.name}: item does not exist in table: ${tableName}, item: ${item}`);
  else {
    table.splice(index, 1);
  }
}

function find(tableName, check, count = 1) {
  const table = getTable(tableName);
  if (table == undefined) return;

  const results = [];

  for (let i = 0; i < table.length && count !== 0; i++) {
    const item = table[i];
    const itemFound = check(item);
    if (itemFound) {
      results.push(item);
      if (count > -1) count--;
    }
  }

  return results;
}
// < Item //

module.exports = {
  create,
  delete: deleteTable,
  get: getTable,
  add,
  remove,
  find,
};

//
// ========== Tester ==========
//
// const createBoard = require('./Board');
// const size = { w: 1, h: 1 };
// function createGame(id) {
//   add('open', {
//     id,
//     host: 'nicko',
//     challenger: null,
//     board: createBoard(size, 5),
//   });
// }

// function joinGame(id) {
//   const game = find('open', (game) => game.id === id);

//   remove('open', game);
//   game.challenger = 'Marslu';
//   add('full', game);
//   game; //?
// }

// create('open');
// create('full');
// createGame(3);
// createGame();
// createGame();
// createGame(2);
// joinGame(2);
// deleteTable('full')
// joinGame(3);

// storage; //?
