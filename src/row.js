function WalkontableRow(wtTable, index) {
  this.wtDom = new WalkontableDom();
  this.wtCell = new WalkontableCell();
  this.wtTable = wtTable;
  this.index = index;
  this.TABLE = wtTable.TABLE;
  this.TR = null;
  this.TSECTION = null;
  this.cells = this.build();
}

WalkontableRow.prototype.build = function () {
  var row = []
    , TD
    , s
    , slen
    , r
    , rlen
    , c
    , clen
    , i
    , sectionOffset = 0
    , col
    , colIndex;
  sections : for (s = 0, slen = this.TABLE.childNodes.length; s < slen; s++) {
    for (r = 0, rlen = this.TABLE.childNodes[s].childNodes.length; r < rlen; r++) {
      if (r + sectionOffset === this.index) {
        this.TR = this.TABLE.childNodes[s].childNodes[r];
        this.TSECTION = this.TR.parentNode;
        col = 0;
        for (c = 0, clen = this.TABLE.childNodes[s].childNodes[r].childNodes.length; c < clen; c++) {
          TD = this.TABLE.childNodes[s].childNodes[r].childNodes[c];
          colIndex = this.wtCell.colIndex(TD);
          while (col < colIndex) {
            var TD2 = this.wtTable.getColumn(col).cells[this.index];
            for (i = TD2.colSpan; i > 0; i--) {
              row.push(TD2);
              col++;
            }
          }
          for (i = TD.colSpan; i > 0; i--) {
            row.push(TD);
            col++;
          }
        }
        break sections;
      }
    }
    sectionOffset += rlen;
  }
  if (this.TR) {
    return row;
  }
  else {
    return null; //row index was not found
  }
};

WalkontableRow.prototype.detach = function () {
  for (var i = 0, ilen = this.cells.length; i < ilen; i++) {
    if (this.cells[i].rowSpan > 1) {
      this.cells[i].rowSpan = this.cells[i].rowSpan - 1;
      if (this.wtCell.rowIndex(this.cells[i]) === this.index) {
        var futureNeighbor = this.nextRow().cells[i + 1];
        futureNeighbor.parentNode.insertBefore(this.cells[i], futureNeighbor);
        if (!this.cells[i].rowParentOffset) {
          this.cells[i].rowParentOffset = 0;
        }
        this.cells[i].rowParentOffset++;
      }
      if (!this.cells[i].rowSpanOffset) {
        this.cells[i].rowSpanOffset = 0;
      }
      this.cells[i].rowSpanOffset++;
    }
  }
  this.TSECTION.removeChild(this.TR);
};

WalkontableRow.prototype.attach = function () {
  for (var i = 0, ilen = this.cells.length; i < ilen; i++) {
    if (this.cells[i].rowSpanOffset) {
      if (!this.wtDom.isFragment(this.cells[i].parentNode)) {
        this.cells[i].rowSpan = this.cells[i].rowSpan + 1;
        this.cells[i].rowSpanOffset--;
      }
    }
    if (this.cells[i].rowParentOffset) {
      if (!this.wtDom.isFragment(this.cells[i].parentNode)) {
        this.cells[i].rowParentOffset--;
      }
      var futureNeighbor = this.cells[i + 1];
      this.TR.insertBefore(this.cells[i], futureNeighbor);
    }
  }

  var nextRow = this.nextRow();
  while (nextRow) {
    if (nextRow.TR.parentNode === this.TSECTION) { // have same parent && nextRow is attached to DOM
      this.TSECTION.insertBefore(this.TR, nextRow.TR);
      break;
    }
    else {
      nextRow = nextRow.nextRow();
    }
  }
  if (!nextRow) {
    this.TSECTION.appendChild(this.TR);
  }
};

WalkontableRow.prototype.nextRow = function () {
  return this.wtTable.getRow(this.index + 1);
};