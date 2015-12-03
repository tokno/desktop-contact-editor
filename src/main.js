var _ = require('../bower_components/lodash/lodash.min');

var Content = require('./lib/content-provider-adb-client');
var URI = require('./uri');

var Extension = require('./lib/handsontable-extension');

var State = {
  loaded: false,
  table: null,
}

function updateAll(uri, rows, callback) {
  var total = rows.length;
  var count = 0;
  var selector = "#progress";

  AJS.progressBars.update(selector, 0);
  $(selector).css("display", "inline-block");

  var next = (row) => {
    var id = row.get("_id").before;
    var bindings = row.cells
      .filter((cell) => cell.dirty)
      .map((cell) => {
        return {
          key: cell.columnName,
          value: cell.after,
        }
      });

    Content.update(uri, id, bindings).then(() => {
      count++;

      var progress = count / total;
      AJS.progressBars.update(selector, progress);

      if (rows.length) {
        next(rows.shift());
      } else {
        done();
      }
    });
  };

  var done = () => {
    setTimeout(() => {
      $(selector).css("display", "none");
      AJS.progressBars.update(selector, 0);
    }, 1000);
    callback();
  };

  next(rows.shift());
}

function load(uri) {
  $("#content-table").empty();

  var selector = "#progress";
  console.log(">>>>> loading");

  Content.query(uri).then((result) => {
    State.loaded = true;
    State.table = createTable(result);

    console.log("<<<<< loading row_count:" + State.table.rows.length);
  });
}

function save(uri) {
  var table = State.table;

  if (!table) {
    return;
  }

  var dirtyRows = table.rows.filter((row) => row.dirty);

  if (!dirtyRows.length) {
    return;
  }

  console.log(">>>>> saving");
  var rows = _.clone(dirtyRows);

  updateAll(uri, rows, () => {
    console.log("<<<<< saving");

    // reload
    load(uri);
  });

  return;
}

function createTable(tableData) {
  var container = $("#content-table");
  var columns = tableData.columns;
  var data = [];

  tableData.rows.forEach((entity) => {
    var row = columns.map((column) => entity[column]);
    data.push(row);
  });

  container.empty();

  table = new Handsontable(container[0], {
    data: _.cloneDeep(data),
    colHeaders: columns,
    columnSorting: true,
    maxRows: data.length,
    maxCols: columns.length,
  });

  table = Extension.applyTo(table);
  table.source = data;

  return table;
}

$(() => {
  $("form").on("submit", (e) => e.preventDefault());

  // ドロップダウン初期化
  for (var category in URI) {
    $("#select-category")
      .append(`<option data-uri='${URI[category]}'>${category}</option>`);
  }

  // 読込みボタン
  $("#load").on("click", () => {
    State.uri = $("#select-category > option:selected").data("uri");
    load(State.uri);
  });

  // 保存ボタン
  $("#save").on("click", () => {
    save(State.uri);
  });
});

