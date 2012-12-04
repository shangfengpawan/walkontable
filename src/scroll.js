function WalkontableScroll(instance) {
  this.instance = instance;
  this.wtScrollbarV = new WalkontableScrollbar(instance, 'vertical');
  this.wtScrollbarH = new WalkontableScrollbar(instance, 'horizontal');
}

WalkontableScroll.prototype.refreshScrollbars = function () {
  this.wtScrollbarV.refresh();
  this.wtScrollbarH.refresh();
};

WalkontableScroll.prototype.scrollVertical = function (delta) {
  var offsetRow = this.instance.getSetting('offsetRow')
    , max = this.instance.getSetting('totalRows') - this.instance.getSetting('displayRows');
  if (max < 0) {
    max = 0;
  }
  offsetRow = offsetRow + delta;
  if (offsetRow < 0) {
    offsetRow = 0;
  }
  else if (offsetRow >= max) {
    offsetRow = max;
  }
  this.instance.update('offsetRow', offsetRow);
  return this.instance;
};

WalkontableScroll.prototype.scrollHorizontal = function (delta) {
  var displayColumns = this.instance.getSetting('displayColumns');
  if (displayColumns !== null) {
    var offsetColumn = this.instance.getSetting('offsetColumn')
      , max = this.instance.getSetting('totalColumns') - displayColumns;
    if (max < 0) {
      max = 0;
    }
    offsetColumn = offsetColumn + delta;
    if (offsetColumn < 0) {
      offsetColumn = 0;
    }
    else if (offsetColumn >= max) {
      offsetColumn = max;
    }
    this.instance.update('offsetColumn', offsetColumn);
  }
  return this.instance;
};

/**
 * Scrolls viewport to a cell by minimum number of cells
 */
WalkontableScroll.prototype.scrollViewport = function (coords) {
  var offsetRow = this.instance.getSetting('offsetRow')
    , offsetColumn = this.instance.getSetting('offsetColumn')
    , displayRows = this.instance.getSetting('displayRows')
    , displayColumns = this.instance.getSetting('displayColumns')
    , totalRows = this.instance.getSetting('totalRows')
    , totalColumns = this.instance.getSetting('totalColumns');

  if (coords[0] < 0 || coords[0] > totalRows - 1) {
    throw new Error('row ' + coords[0] + ' does not exist');
  }
  else if (coords[1] < 0 || coords[1] > totalColumns - 1) {
    throw new Error('column ' + coords[1] + ' does not exist');
  }

  if (displayRows < totalRows) {
    if (coords[0] > offsetRow + displayRows - 1) {
      this.scrollVertical(coords[0] - (offsetRow + displayRows - 1));
    }
    else if (coords[0] < offsetRow) {
      this.scrollVertical(coords[0] - offsetRow);
    }
  }

  if (displayColumns < totalColumns) {
    if (coords[1] > offsetColumn + displayColumns - 1) {
      this.scrollHorizontal(coords[1] - (offsetColumn + displayColumns - 1));
    }
    else if (coords[1] < offsetColumn) {
      this.scrollHorizontal(coords[1] - offsetColumn);
    }
  }

  return this.instance;
};