var AdbShell = require('./adb-shell');

function splitPair(str) {
  var mark = "=";
  var pairs = [];

  if (str === "") { return pairs; }

  var idx
  while (~(idx = str.indexOf(mark, str.indexOf(mark) + 1))) {
    for (var i = idx - 1; 0 <= i; i--) {
      var ch = str[i];
      if (ch === " ") {
        idx = i;
        break;
      }
    }

    pairs.push(str.substr(0, idx - 1));
    str = str.substr(idx + 1);
  }

  pairs.push(str);
  return pairs;
}

// "key=value" => { k: "key", v: "value" }
function kv(str) {
  var boundary = str.indexOf("=");
  return {
    k: str.substr(0, boundary),
    v: str.substr(boundary + 1),
  }
}

var query = (uri) =>new Promise((resolve, reject) => {
  AdbShell.execAsync(`content query --uri ${uri}`).then((out) => {
    // [
    //   "key1=value1, key2=value2",
    //   ...
    // ]
    var rows = out.split('\n')
      .map((line) => line.match(/Row: \d+ (.*)/))
      .filter(match => !!match)
      .map(match => match[1]);

    if (!rows.length) {
      resolve({ columns: [], rows: [] });
      return;
    }

    // [
    //   [ "key1=value1", "key2=value2"... ]
    //   ...
    // ]
    var rawEntities = rows
      .map((row) => splitPair(row));

    var keys = rawEntities[0]
      .map((pair) => kv(pair).k)
      .filter((v, i, self) => self.indexOf(v) == i)
      .sort();

    // [
    //   { key1: "value1", key2: "value2" },
    //   ...
    // ]
    var entities = rawEntities.map((pairs) =>
        pairs.reduce((entity, pair) => {
          var keyValue = kv(pair);
          entity[keyValue.k] = keyValue.v;

          return entity;
        }, {})
      );

    resolve({
      columns: keys,
      rows: entities,
    });
  });
});

var update = (uri, id, bindings) => new Promise((resolve, reject) => {
  var bindingStr = bindings.map((binding) =>
      `--bind "${binding.key}:s:${binding.value}"`).join(" ");

  var cmd = `content update --uri ${uri} ${bindingStr} --where "_id=${id}"`;

  AdbShell.execAsync(cmd).then((out) => {
    resolve(out);
  });
});


module.exports = {
  query: query,
  update: update,
}

