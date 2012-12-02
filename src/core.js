function Walkontable(settings) {
  var that = this;
  var originalHeaders = [];

  //default settings. void 0 means it is required, null means it can be empty
  var defaults = {
    table: void 0,
    data: void 0,
    offsetRow: 0,
    offsetColumn: 0,
    rowHeaders: false,
    columnHeaders: false,
    totalRows: void 0,
    totalColumns: void 0,
    displayRows: function () {
      return that.getSetting('totalRows'); //display all rows by default
    },
    displayColumns: function () {
      if (that.wtTable.THEAD.childNodes[0].childNodes.length) {
        return that.wtTable.THEAD.childNodes[0].childNodes.length;
      }
      else {
        return that.getSetting('totalColumns'); //display all columns by default
      }
    },
    selections: null,
    onCellMouseDown: null
  };

  //reference to settings
  this.settings = {};
  for (var i in defaults) {
    if (defaults.hasOwnProperty(i)) {
      if (settings[i] !== void 0) {
        this.settings[i] = settings[i];
      }
      else if (defaults[i] === void 0) {
        throw new Error('A required setting "' + i + '" was not provided');
      }
      else {
        this.settings[i] = defaults[i];
      }
    }
  }

  //bootstrap from settings
  this.wtTable = new WalkontableTable(this);
  this.wtScrollV = new WalkontableScrollbar(this, 'vertical');
  this.wtScrollH = new WalkontableScrollbar(this, 'horizontal');
  this.wtWheel = new WalkontableWheel(this);
  this.wtEvent = new WalkontableEvent(this);
  this.wtDom = new WalkontableDom();

  //find original headers
  if (this.wtTable.THEAD.childNodes.length && this.wtTable.THEAD.childNodes[0].childNodes.length) {
    for (var c = 0, clen = this.wtTable.THEAD.childNodes[0].childNodes.length; c < clen; c++) {
      originalHeaders.push(this.wtTable.THEAD.childNodes[0].childNodes[c].innerHTML);
    }
    if (!this.hasSetting('columnHeaders')) {
      this.settings.columnHeaders = function (column) {
        return originalHeaders[column];
      }
    }
  }

  //initialize selections
  this.selections = {};
  if (this.settings.selections) {
    for (i in this.settings.selections) {
      if (this.settings.selections.hasOwnProperty(i)) {
        this.selections[i] = (function (setting) {
          return new WalkontableSelection(function (coords) {
            var TD = that.wtTable.getCell(coords);
            if (setting.className) {
              that.wtDom.addClass(TD, setting.className);
            }
            if (setting.border) {
              TD.style.outline = setting.border.width + 'px ' + setting.border.style + ' ' + setting.border.color;
            }
          }, function (coords) {
            var TD = that.wtTable.getCell(coords);
            if (setting.className) {
              that.wtDom.removeClass(TD, setting.className);
            }
            if (setting.border) {
              TD.style.outline = '';
            }
          });
        })(this.settings.selections[i])
      }
    }
  }

  this.drawn = false;
}

Walkontable.prototype.draw = function () {
  this.wtTable.draw();
  this.wtScrollV.refresh();
  this.wtScrollH.refresh();
  this.drawn = true;
  return this;
};

Walkontable.prototype.update = function (settings, value) {
  if (value === void 0) { //settings is object
    for (var i in settings) {
      if (settings.hasOwnProperty(i)) {
        this.settings[i] = settings[i];
      }
    }
  }
  else { //if value is defined then settings is the key
    this.settings[settings] = value;
  }
  return this;
};

Walkontable.prototype.scrollVertical = function (delta) {
  var max = this.getSetting('totalRows') - 1 - this.getSetting('displayRows');
  if (max < 0) {
    max = 0;
  }
  this.settings.offsetRow = this.settings.offsetRow + delta;
  if (this.settings.offsetRow < 0) {
    this.settings.offsetRow = 0;
  }
  else if (this.settings.offsetRow >= max) {
    this.settings.offsetRow = max;
  }
  return this;
};

Walkontable.prototype.scrollHorizontal = function (delta) {
  var max = this.getSetting('totalColumns') - this.settings.displayColumns;
  if (this.hasSetting('rowHeaders')) {
    max++;
  }
  if (max < 0) {
    max = 0;
  }
  this.settings.offsetColumn = this.settings.offsetColumn + delta;
  if (this.settings.offsetColumn < 0) {
    this.settings.offsetColumn = 0;
  }
  else if (this.settings.offsetColumn >= max) {
    this.settings.offsetColumn = max;
  }
  return this;
};

Walkontable.prototype.getSetting = function (key, param1, param2, param3) {
  if (typeof this.settings[key] === 'function') {
    return this.settings[key](param1, param2, param3);
  }
  else {
    return this.settings[key];
  }
};

Walkontable.prototype.hasSetting = function (key) {
  return !!this.settings[key]
};