describe('Walkontable', function () {
  var $table
    , data;

  var debug = true;

  beforeEach(function () {
    $table = $('<table><thead><th></th><th></th></thead><tbody></tbody></table>'); //create a table that is not attached to document
    data = [];
    for (var i = 0; i < 100; i++) {
      data.push([i, "a", "b", "c"]);
    }
  });

  afterEach(function () {
    if (debug) {
      $table.appendTo('body');
    }
  });

  /**
   * Walkontable (constructor)
   */

  it("should create as many rows as in `displayRows`", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: data,
      startRow: 0,
      displayRows: 10
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(10);
  });

  it("first row should have as many columns as in THEAD", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: data,
      startRow: 0,
      displayRows: 10
    });
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe($table.find('thead th').length);
  });

  it("first row should have the same text as in data source", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: data,
      startRow: 0,
      displayRows: 10
    });
    wt.draw();
    var TDs = $table.find('tbody tr:first td');
    expect(TDs[0].innerHTML).toBe('0');
    expect(TDs[1].innerHTML).toBe('a');
  });

  it("first row (scrolled to 10) should have the same text as in data source", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: data,
      startRow: 10,
      displayRows: 10
    });
    wt.draw();
    var TDs = $table.find('tbody tr:first td');
    expect(TDs[0].innerHTML).toBe('10');
    expect(TDs[1].innerHTML).toBe('a');
  });

  it("update should change setting", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: data,
      startRow: 0,
      displayRows: 10
    });
    wt.update({startRow: 10});
    wt.draw();
    var TDs = $table.find('tbody tr:first td');
    expect(TDs[0].innerHTML).toBe('10');
    expect(TDs[1].innerHTML).toBe('a');
  });
});