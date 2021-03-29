module.exports.mdArray = 'under construction';

module.exports.createTable = (size = { w: 0, h: 0 }, defaultValue = undefined) => {
  const table = [];
  const { w, h } = size;
  let x = w;
  let y = h;

  while (y--) {
    const row = [];
    while (x--) {
      row.push(defaultValue);
    }
    x = w;
    table.push(row);
  }

  return table;
};
