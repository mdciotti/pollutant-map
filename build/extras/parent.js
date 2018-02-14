var cp = require('child_process');

function createChild(filepath) {
    var n = cp.fork('child.js');

    n.on('message', function (m) {
        console.log('Parent received:', m);
    });

    n.send(filepath);
}

var i = 0;
setInterval(function () {
    createChild(`test${i}.csv`);
    i++;
}, 2000);

