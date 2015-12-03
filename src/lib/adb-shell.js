var childProcess = require('child_process');
const MAX_BUFFER_SIZE = 512 * 1024 * 1024;

module.exports = {
  execAsync(cmd) {
    var adbCmd = `adb shell ${cmd}`;
    console.log(`$ ${adbCmd}`);

    return new Promise((resolve, reject) => {
      childProcess.exec(adbCmd, {
        maxBuffer: MAX_BUFFER_SIZE,
      }, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);

        if (err) {
          reject(err);
          return;
        }

        resolve(stdout);
      });
    });
  },
}

