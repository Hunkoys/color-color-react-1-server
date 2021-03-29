const { random } = require('../common/random');

class Board {
  constructor(size, nColors) {
    this.size = size;
    this.colorTable = [];
    this.build();
    if (nColors) this.colorize(nColors);
  }

  build() {
    const { w, h } = this.size;
    let x = w;
    let y = h;

    while (y--) {
      const row = [];
      while (x--) {
        row.push(null);
      }
      x = w;
      this.colorTable.push(row);
    }
  }

  colorize(n) {
    this.fillSquares((above, before) => this.randomColor(n).except([above, before]));
  }

  fillSquares(assigner) {
    const rowsTotal = this.colorTable.length;

    for (let rowIndex = 0; rowIndex < rowsTotal; rowIndex++) {
      const row = this.colorTable[rowIndex];
      const squaresTotal = row.length;

      for (let squareIndex = 0; squareIndex < squaresTotal; squareIndex++) {
        const above = this.square(squareIndex, rowIndex - 1);
        const before = this.square(squareIndex - 1, rowIndex);
        this.colorTable[rowIndex][squareIndex] = assigner(above, before);
      }
    }
  }

  square(x, y) {
    const row = this.colorTable[y];
    if (row) return row[x];

    return undefined;
  }

  randomColor(n) {
    return {
      except(items) {
        const choices = [];

        for (let i = 0; i < n; i++) {
          if (!items.includes(i)) choices.push(i);
        }

        const choiceIndex = random(choices.length);
        return choices[choiceIndex];
      },
    };
  }
}

module.exports = generateBoard = ({ size, nColors }) => {
  return {
    table: new Board(size, nColors).colorTable,
    size,
  };
};
