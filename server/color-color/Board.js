const { random } = require('../common/random');

class Board {
  constructor(size, nColors) {
    this.size = size;
    this.colorTable = [];
    this.build();
    if (nColors) this.colorizeBoard(nColors);
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

  colorizeBoard(n) {
    this.fillSquares(({ x, y }, above, before) => {
      const exemptedColors = [above, before];
      const isBottomLeft = y === this.size.h - 1 && x === 0;
      const topRightCoords = { x: this.size.w - 1, y: 0 };
      const topRight = this.square(topRightCoords);
      if (isBottomLeft) exemptedColors.push(topRight);
      return this.randomColor(n).except(exemptedColors);
    });
  }

  fillSquares(assigner) {
    const rowsTotal = this.colorTable.length;

    for (let rowIndex = 0; rowIndex < rowsTotal; rowIndex++) {
      const row = this.colorTable[rowIndex];
      const squaresTotal = row.length;

      for (let squareIndex = 0; squareIndex < squaresTotal; squareIndex++) {
        const aboveCoords = { x: squareIndex, y: rowIndex - 1 };
        const beforeCoords = { x: squareIndex - 1, y: rowIndex };
        const above = this.square(aboveCoords);
        const before = this.square(beforeCoords);
        this.colorTable[rowIndex][squareIndex] = assigner({ x: squareIndex, y: rowIndex }, above, before);
      }
    }
  }

  square({ x, y }) {
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
    nColors,
  };
};
