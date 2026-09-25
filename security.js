(function () {
  'use strict';

  var url = 'main.html';
  var delay = 500;
  var done = false;

  function go() {
    if (done) return;
    done = true;
    try { window.stop(); } catch (e) {}
    try { document.documentElement.innerHTML = ''; } catch (e) {}
    location.replace(url);
  }

  // пристыкованная панель съедает часть окна
  function bySize() {
    return outerWidth - innerWidth > 160 || outerHeight - innerHeight > 160;
  }

  // консоль форматирует аргументы только когда девтулзы открыты,
  // причем table на большом массиве заметно дороже, чем log.
  // ловит и отстыкованное окно
  var data = [];
  (function () {
    var row = {};
    for (var i = 0; i < 500; i++) row[i] = i;
    for (var j = 0; j < 50; j++) data.push(row);
  })();

  var logMax = 0;

  function time(fn) {
    var t = performance.now();
    fn(data);
    return performance.now() - t;
  }

  function bySpeed() {
    var table = time(console.table);
    var log = time(console.log);
    console.clear();
    if (log > logMax) logMax = log;
    if (!table || !logMax) return false;
    return table > logMax * 10;
  }

  // запасной вариант: debugger в воркере встает на паузу только при открытых девтулзах.
  // основной поток не блокируется и видит, что ответа нет
  function watchWorker() {
    var w;
    try {
      var src = 'onmessage=function(){debugger;postMessage(0)}';
      w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
    } catch (e) {
      return;
    }
    var waiting = false;
    w.onmessage = function () { waiting = false; };
    setInterval(function () {
      if (waiting) return go();
      waiting = true;
      w.postMessage(0);
    }, delay);
  }

  function check() {
    if (done) return;
    if (bySize() || bySpeed()) go();
  }

  check();
  if (done) return;
  setInterval(check, delay);
  watchWorker();
})();
