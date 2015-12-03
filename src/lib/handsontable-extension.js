var _ = require('../../bower_components/lodash/lodash.min');

function Cell(table, row, col) {
  this.row = row;
  this.col = col;
}

!function(p) {
  Object.defineProperty(p, "before", {
    get() {
      return table.source[this.row][this.col];
    }
  });

  Object.defineProperty(p, "after", {
    get() {
      return table.getDataAtCell(this.row, this.col);
    }
  });

  Object.defineProperty(p, "dirty", {
    get() {
      return this.before !== this.after;
    },
  });

  Object.defineProperty(p, "columnName", {
    get() {
      return table.getColHeader()[this.col];
    },
  });
}(Cell.prototype);


function Row(table, row) {
  this.table = table;
  this.row = row;
}

!function(p) {
  p.get = function(columnName) {
    var table = this.table;
    var idx = table.getColHeader().indexOf(columnName);

    return this.cells[idx];
  }

  Object.defineProperty(p, "cells", {
    get() {
      var cells = [];

      for (var i=0; i < this.table.countCols(); i++) {
        cells.push(new Cell(this.table, this.row, i));
      }

      return cells;
    },
  });

  Object.defineProperty(p, "dirty", {
    get() {
      return _.any(this.cells, (cell) => cell.dirty);
    },
  });
}(Row.prototype);


function initTable(table) {
  var self = table;

  Object.defineProperty(self, "rows", {
    get() {
      var rows = [];

      for (var i=0; i < self.countRows(); i++) {
        rows.push(new Row(self, i));
      }

      return rows;
    },
  });

  table.addHook('afterChange', (changes, source) => {
    var cells = _.flatten(self.rows.map((row) => row.cells));

    cells.forEach((cell) => {
        $(self.getCell(cell.row, cell.col)).toggleClass("dirty", cell.dirty);
      });
  });
}

module.exports = {
  applyTo(handsontable) {
    initTable(handsontable);

    return handsontable;
  },
}

