describe('WalkontableTable', function () {
  var $table
    , debug = false;

  beforeEach(function () {
    $table = $('<table></table>'); //create a table that is not attached to document
    $table.appendTo('body');
    createDataArray();
  });

  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }
  });

  it("should create as many rows as in `displayRows`", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(10);
  });

  it("should create as many rows as in `totalRows` if it is smaller than `displayRows`", function () {
    this.data.splice(5, this.data.length - 5);

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(5);
  });

  it("first row should have as many columns as in THEAD", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: 'A',
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe($table.find('thead th').length);
  });

  it("should use columnHeaders function to generate column headers", function () {
    var headers = ["Description", 2012, 2013, 2014, 2015];
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2,
      columnHeaders: function (column) {
        return headers[column];
      }
    });
    wt.draw();
    expect($table.find('thead tr:first th').length).toBe(2);
    expect($table.find('thead tr:first th:last')[0].innerHTML).toBe('2012');
  });

  it("should use rowHeaders function to generate row headers", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2,
      frozenColumns: [function (row) {
        return row + 1;
      }]
    });
    wt.draw();
    expect($table.find('tbody th, tbody td').length).toBe(30); //10*2=20 displayed cells + 10 row headers
    expect($table.find('tbody th').length).toBe(10); //10*2=20 displayed cells, half of which are td
    expect($table.find('tbody tr:first th').length).toBe(1); //only one th per row
    expect($table.find('tbody tr:first th')[0].innerHTML).toBe('1'); //this should be the first row header
  });

  it("should put a blank cell in the corner if both rowHeaders and colHeaders are set", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2,
      columnHeaders: "Column",
      frozenColumns: ['Row']
    });
    wt.draw();
    expect($table.find('thead tr:first th').length).toBe(3); //2 columns in THEAD
    expect($table.find('thead tr:first th:eq(0)')[0].innerHTML.replace(/&nbsp;/, '')).toBe(''); //corner row is empty (or contains only &nbsp;)
    expect($table.find('thead tr:first th:eq(1)')[0].innerHTML).toBe('Column');
    expect($table.find('tbody tr:first th:eq(0)')[0].innerHTML).toBe('Row');
  });

  it("rowHeaders and colHeaders should respect the offset", function () {
    function plusOne(i) {
      return i + 1;
    }

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 1,
      offsetColumn: 1,
      displayRows: 10,
      displayColumns: 2,
      columnHeaders: plusOne,
      frozenColumns: [plusOne]
    });
    wt.draw();
    expect($table.find('tr:eq(0) th:eq(1)')[0].innerHTML).toBe('2');
    expect($table.find('tr:eq(1) th:eq(0)')[0].innerHTML).toBe('2');
  });

  it("getCell should only return cells from visible rows", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 10,
      offsetColumn: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();

    var $td1 = $table.find('tbody tr:first td:first');
    var $td2 = $table.find('tbody tr:last td:first');
    expect(wt.wtTable.getCell([9, 0])).toBe(-1); //exit code
    expect(wt.wtTable.getCell([10, 0])).toBe($td1[0]);
    expect(wt.wtTable.getCell([19, 0])).toBe($td2[0]);
    expect(wt.wtTable.getCell([20, 0])).toBe(-2); //exit code
  });

  it("getCell should only return cells from visible columns", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();

    wt.update('offsetColumn', 1).draw();

    var $td1 = $table.find('tbody tr:eq(0) td:eq(0)');
    var $td2 = $table.find('tbody tr:eq(0) td:eq(1)');
    expect(wt.wtTable.getCell([0, 0])).toBe(-3); //exit code
    expect(wt.wtTable.getCell([0, 1])).toBe($td1[0]);
    expect(wt.wtTable.getCell([0, 2])).toBe($td2[0]);
    expect(wt.wtTable.getCell([0, 3])).toBe(-4); //exit code
  });

  it("getCell should only return cells from visible columns (with row header)", function () {
    function plusOne(i) {
      return i + 1;
    }

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      displayRows: 10,
      displayColumns: 2,
      frozenColumns: [plusOne]
    });
    wt.draw();

    wt.update('offsetColumn', 1).draw();

    var $td1 = $table.find('tbody tr:first td:eq(0)');
    var $td2 = $table.find('tbody tr:first td:eq(1)');
    expect(wt.wtTable.getCell([0, 0])).toBe(-3); //exit code
    expect(wt.wtTable.getCell([0, 1])).toBe($td1[0]);
    expect(wt.wtTable.getCell([0, 2])).toBe($td2[0]);
    expect(wt.wtTable.getCell([0, 3])).toBe(-4); //exit code
  });

  it("getCoords should return coords of TD", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();

    wt.update({
      offsetRow: 1,
      offsetColumn: 1
    }).draw();

    var $td2 = $table.find('tbody tr:eq(1) td:eq(1)');
    expect(wt.wtTable.getCoords($td2[0])).toEqual([2, 2]);
  });

  it("getCoords should return coords of TD (with row header)", function () {
    function plusOne(i) {
      return i + 1;
    }

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      displayRows: 10,
      displayColumns: 2,
      frozenColumns: [plusOne]
    });
    wt.draw();

    wt.update({
      offsetRow: 1,
      offsetColumn: 1
    }).draw();

    var $td2 = $table.find('tbody tr:eq(1) td:eq(0)');
    expect(wt.wtTable.getCoords($td2[0])).toEqual([2, 1]);
  });

  it("should use custom cell renderer if provided", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2,
      cellRenderer: function (row, column, TD) {
        var cellData = getData(row, column);
        if (cellData !== void 0) {
          TD.innerHTML = cellData;
        }
        else {
          TD.innerHTML = '';
        }
        TD.className = '';
        TD.style.backgroundColor = 'yellow';
      }
    });
    wt.draw();
    expect($table.find('td:first')[0].style.backgroundColor).toBe('yellow');
  });

  it("should remove rows if they were removed in data source", function () {
    this.data.splice(8, this.data.length - 8); //second param is required by IE7-8

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(8);

    this.data.splice(7, this.data.length - 7); //second param is required by IE7-8
    wt.draw();
    expect($table.find('tbody tr').length).toBe(7);
  });

  it("should add columns when displayColumns is increased", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 2
    });
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe(2);

    wt.update('displayColumns', 3).draw();
    expect($table.find('tbody tr:first td').length).toBe(3);
  });

  it("should remove columns when displayColumns is decreased", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 3
    });
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe(3);

    wt.update('displayColumns', 2).draw();
    expect($table.find('tbody tr:first td').length).toBe(2);
  });

  it("should remove columns when displayColumns is decreased (with column header)", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      displayRows: 10,
      displayColumns: 3,
      columnHeaders: "Col"
    });
    wt.draw();
    expect($table.find('thead tr:first th').length).toBe(3);
    expect($table.find('tbody tr:first td').length).toBe(3);

    wt.update('displayColumns', 2).draw();
    expect($table.find('thead tr:first th').length).toBe(2);
    expect($table.find('tbody tr:first td').length).toBe(2);
  });

  it("should render all rows if displayRows is null", function () {
    this.data.splice(20, this.data.length - 20); //second param is required by IE7-8

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayColumns: 4,
      offsetRow: 0,
      offsetColumn: 0
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(20);
  });

  it("should render all columns if displayColumns is null", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      columnHeaders: "Col"
    });
    wt.draw();
    expect($table.find('thead tr:first').children().length).toBe(4);
    expect($table.find('tbody tr:first').children().length).toBe(4);
  });

  it("should render all columns if displayColumns is null (with row header)", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      frozenColumns: ['Row'],
      columnHeaders: "Col"
    });
    wt.draw();
    expect($table.find('thead tr:first').children().length).toBe(5);
    expect($table.find('tbody tr:first').children().length).toBe(5);
  });

  it("row header column should have 'rowHeader' class", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      frozenColumns: ['Row'],
      columnHeaders: "Col"
    });
    wt.draw();
    expect($table.find('col:first').hasClass('rowHeader')).toBe(true);
  });

  it("should use column width function to get column width", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      frozenColumns: ['Row'],
      columnHeaders: "Col",
      columnWidth: function (column) {
        return (column + 1) * 50
      }
    });
    wt.draw();
    expect($.inArray($table.find('tbody tr:first td:eq(0)').width(), [48, 50]) > -1).toBe(true); //IE7 reports 48, other browsers report 50
    expect($.inArray($table.find('tbody tr:first td:eq(1)').width(), [98, 100]) > -1).toBe(true); //IE7 reports 98, other browsers report 100
    expect($.inArray($table.find('tbody tr:first td:eq(2)').width(), [148, 150]) > -1).toBe(true); //IE7 reports 148, other browsers report 150
    expect($.inArray($table.find('tbody tr:first td:eq(3)').width(), [198, 200]) > -1).toBe(true); //IE7 reports 198, other browsers report 200
  });

  it("should use column width array to get column width", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      frozenColumns: ['Row'],
      columnHeaders: "Col",
      columnWidth: [50, 100, 150, 200]
    });
    wt.draw();
    expect($.inArray($table.find('tbody tr:first td:eq(0)').width(), [48, 50]) > -1).toBe(true); //IE7 reports 48, other browsers report 50
    expect($.inArray($table.find('tbody tr:first td:eq(1)').width(), [98, 100]) > -1).toBe(true); //IE7 reports 98, other browsers report 100
    expect($.inArray($table.find('tbody tr:first td:eq(2)').width(), [148, 150]) > -1).toBe(true); //IE7 reports 148, other browsers report 150
    expect($.inArray($table.find('tbody tr:first td:eq(3)').width(), [198, 200]) > -1).toBe(true); //IE7 reports 198, other browsers report 200
  });

  it("should use column width integer to get column width", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      frozenColumns: ['Row'],
      columnHeaders: "Col",
      columnWidth: 100
    });
    wt.draw();
    expect($.inArray($table.find('tbody tr:first td:eq(0)').width(), [98, 100]) > -1).toBe(true); //IE7 reports 98, other browsers report 100
    expect($.inArray($table.find('tbody tr:first td:eq(1)').width(), [98, 100]) > -1).toBe(true); //IE7 reports 98, other browsers report 100
    expect($.inArray($table.find('tbody tr:first td:eq(2)').width(), [98, 100]) > -1).toBe(true); //IE7 reports 98, other browsers report 100
    expect($.inArray($table.find('tbody tr:first td:eq(3)').width(), [98, 100]) > -1).toBe(true); //IE7 reports 98, other browsers report 100
  });

  it("should render as much frozen columns as defined", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      displayRows: 10,
      offsetRow: 0,
      offsetColumn: 0,
      frozenColumns: [
        'Some',
        'thing'
      ],
      columnHeaders: "Col",
      columnWidth: 100
    });
    wt.draw();
    expect($table.find('thead tr:first th').length).toBe(getTotalColumns() + 2);
    expect($table.find('tbody tr:first th:eq(0)').html()).toBe("Some");
    expect($table.find('tbody tr:first th:eq(1)').html()).toBe("thing");
  });

  it("should not render a cell that is outside of the viewport horizontally", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      width: 200,
      height: 100,
      offsetRow: 0,
      offsetColumn: 0,
      columnWidth: 100
    });
    wt.draw();
    $table.find('tbody td').html('');
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBeGreaterThan(3); //there are more columns though there won't be rendered
    expect($table.find('tbody tr:first td:eq(1)').html()).not.toBe('');
    expect($table.find('tbody tr:first td:eq(2)').html()).toBe('');
  });

  it("should not render a cell that is outside of the viewport, when width (height) is not dividable by 50 (20)", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      width: 201,
      height: 101,
      offsetRow: 0,
      offsetColumn: 0,
      columnWidth: 100
    });
    wt.draw();
    $table.find('tbody td').html('');
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBeGreaterThan(3); //there are more columns though there won't be rendered
    expect($table.find('tbody tr:first td:eq(1)').html()).not.toBe('');
    expect($table.find('tbody tr:first td:eq(2)').html()).toBe('');
  });

  it("should not render a cell that is outside of the viewport horizontally", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      width: 200,
      height: 100,
      offsetRow: 0,
      offsetColumn: 0,
      columnWidth: 100
    });
    wt.draw();
    $table.find('tbody td').html('');
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBeGreaterThan(3); //there are more columns though there won't be rendered
    expect($table.find('tbody tr:first td:eq(1)').html()).not.toBe('');
    expect($table.find('tbody tr:first td:eq(2)').html()).toBe('');
  });

  it("should not render a cell when selectionsOnly == true", function () {
    var count = 0
      , wt = new Walkontable({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        width: 200,
        height: 100,
        offsetRow: 0,
        offsetColumn: 0,
        columnWidth: 100,
        cellRenderer: function (row, column, TD) {
          count++;
          return wt.defaults.cellRenderer(row, column, TD);
        }
      });
    wt.draw();
    var oldCount = count;
    wt.draw(true);
    expect(count).toBe(oldCount);
  });

  it("should ignore selectionsOnly == true when grid was scrolled", function () {
    var count = 0
      , wt = new Walkontable({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        width: 200,
        height: 100,
        offsetRow: 0,
        offsetColumn: 0,
        columnWidth: 100,
        cellRenderer: function (row, column, TD) {
          count++;
          return wt.defaults.cellRenderer(row, column, TD);
        }
      });
    wt.draw();
    var oldCount = count;
    wt.scrollVertical(1);
    wt.draw(true);
    expect(count).toBeGreaterThan(oldCount);
  });

  /**
   * stretchH
   */
  it("should strech all visible columns when stretchH equals 'all'", function () {
    createDataArray(20, 2);

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      width: 300,
      height: 200,
      scrollH: 'scroll',
      scrollV: 'scroll',
      stretchH: 'all',
      frozenColumns: [
        "Col"
      ]
    });
    wt.draw();

    var wtHider = $table.parents('.wtHider');
    expect(wtHider.outerWidth()).toBe($table.outerWidth());
    expect(wtHider.find('col:eq(1)').width()).toBe(wtHider.find('col:eq(2)').width() - 1); //first is 106, last is 107 due to remaining part
  });

  it("should strech last visible column when stretchH equals 'last'", function () {
    createDataArray(20, 2);

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      width: 300,
      height: 200,
      scrollH: 'scroll',
      scrollV: 'scroll',
      stretchH: 'last',
      frozenColumns: [
        "Col"
      ]
    });
    wt.draw();

    var wtHider = $table.parents('.wtHider');
    expect(wtHider.outerWidth()).toBe($table.outerWidth());
    expect(wtHider.find('col:eq(1)').width()).toBeLessThan(wtHider.find('col:eq(2)').width());
  });

  it("should not strech when stretchH equals 'none'", function () {
    createDataArray(20, 2);

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      width: 300,
      height: 200,
      scrollH: 'scroll',
      scrollV: 'scroll',
      stretchH: 'none',
      frozenColumns: [
        "Col"
      ]
    });
    wt.draw();

    var wtHider = $table.parents('.wtHider');
    expect(wtHider.width()).toBeGreaterThan($table.width());
    expect(wtHider.find('col:eq(1)').width()).toBe(wtHider.find('col:eq(2)').width());
  });
});