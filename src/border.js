function WalkontableBorder(instance, settings) {
  //reference to instance
  this.instance = instance;
  this.settings = settings;

  this.main = document.createElement("div");
  this.main.style.position = 'absolute';
  this.main.style.top = 0;
  this.main.style.left = 0;

  for (var i = 0; i < 4; i++) {
    var DIV = document.createElement('DIV');
    DIV.className = 'wtBorder ' + settings.className;
    DIV.style.backgroundColor = settings.border.color;
    DIV.style.height = settings.border.width + 'px';
    DIV.style.width = settings.border.width + 'px';
    this.main.appendChild(DIV);
  }

  this.top = this.main.childNodes[0];
  this.left = this.main.childNodes[1];
  this.bottom = this.main.childNodes[2];
  this.right = this.main.childNodes[3];

  this.disappear();
  instance.wtTable.TABLE.parentNode.appendChild(this.main);
}

/**
 * Show border around one or many cells
 * @param {Array} corners
 */
WalkontableBorder.prototype.appear = function (corners) {
  var $from, $to, fromOffset, toOffset, containerOffset, top, minTop, left, minLeft, height, width;
  if (this.disabled) {
    return;
  }

  var offsetRow = this.instance.getSetting('offsetRow')
    , offsetColumn = this.instance.getSetting('offsetColumn')
    , displayRows = this.instance.getSetting('displayRows')
    , displayColumns = this.instance.getSetting('displayColumns');

  var hideTop, hideLeft, hideBottom, hideRight;

  if (displayRows !== null) {
    if (corners[0] > offsetRow + displayRows - 1 || corners[2] < offsetRow) {
      hideTop = hideLeft = hideBottom = hideRight = true;
    }
    else {
      if (corners[0] < offsetRow) {
        corners[0] = offsetRow;
        hideTop = true;
      }
      if (corners[2] > offsetRow + displayRows - 1) {
        corners[2] = offsetRow + displayRows - 1;
        hideBottom = true;
      }
    }
  }

  if (displayColumns !== null) {
    if (corners[1] > offsetColumn + displayColumns - 1 || corners[3] < offsetColumn) {
      hideTop = hideLeft = hideBottom = hideRight = true;
    }
    else {
      if (corners[1] < offsetColumn) {
        corners[1] = offsetColumn;
        hideLeft = true;
      }
      if (corners[3] > offsetColumn + displayColumns - 1) {
        corners[3] = offsetColumn + displayColumns - 1;
        hideRight = true;
      }
    }
  }

  if (!(hideTop == hideLeft == hideBottom == hideRight == true)) {
    $from = $(this.instance.wtTable.getCell([corners[0], corners[1]]));
    $to = (corners.length > 2) ? $(this.instance.wtTable.getCell([corners[2], corners[3]])) : $from;
    fromOffset = $from.offset();
    toOffset = (corners.length > 2) ? $to.offset() : fromOffset;
    containerOffset = $(this.instance.wtTable.TABLE).offset();

    minTop = fromOffset.top;
    height = toOffset.top + $to.outerHeight() - minTop;
    minLeft = fromOffset.left;
    width = toOffset.left + $to.outerWidth() - minLeft;

    top = minTop - containerOffset.top - 1;
    left = minLeft - containerOffset.left - 1;

    if (parseInt($from.css('border-top-width')) > 0) {
      top += 1;
      //height -= 1;
    }
    if (parseInt($from.css('border-left-width')) > 0) {
      left += 1;
      //width -= 1;
    }
  }

  if (hideTop) {
    this.top.style.display = 'none';
  }
  else {
    this.top.style.top = top + 'px';
    this.top.style.left = left + 'px';
    this.top.style.width = width + 'px';
    this.top.style.display = 'block';
  }

  if (hideLeft) {
    this.left.style.display = 'none';
  }
  else {
    this.left.style.top = top + 'px';
    this.left.style.left = left + 'px';
    this.left.style.height = height + 'px';
    this.left.style.display = 'block';
  }

  var delta = Math.floor(this.settings.border.width / 2);

  if (hideBottom) {
    this.bottom.style.display = 'none';
  }
  else {
    this.bottom.style.top = top + height - delta + 'px';
    this.bottom.style.left = left + 'px';
    this.bottom.style.width = width + 'px';
    this.bottom.style.display = 'block';
  }

  if (hideRight) {
    this.right.style.display = 'none';
  }
  else {
    this.right.style.top = top + 'px';
    this.right.style.left = left + width - delta + 'px';
    this.right.style.height = height + 1 + 'px';
    this.right.style.display = 'block';
  }
};

/**
 * Hide border
 */
WalkontableBorder.prototype.disappear = function () {
  this.top.style.display = 'none';
  this.left.style.display = 'none';
  this.bottom.style.display = 'none';
  this.right.style.display = 'none';
};