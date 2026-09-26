(function () {
  'use strict';

  var url = 'main.html';
  var delay = 50;
  var done = false;

  function go() {
    if (done) return;
    done = true;
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

  function check() {
    if (done) return;
    if (bySize() || bySpeed()) go();
  }

  // хоткеи девтулзов сначала приходят странице: отменяем открытие и сразу уходим,
  // иначе после F12 можно успеть нажать F8 и остановить скрипт
  function isDevtoolsKey(e) {
    var k = (e.key || '').toLowerCase();
    if (e.keyCode === 123 || k === 'f12') return true;
    var code = e.code || '';
    var letter = code === 'KeyI' || code === 'KeyJ' || code === 'KeyC';
    if (e.ctrlKey && e.shiftKey && letter) return true;
    if (e.metaKey && e.altKey && (letter || code === 'KeyU')) return true;
    if ((e.ctrlKey || e.metaKey) && code === 'KeyU') return true;
    return false;
  }

  addEventListener('keydown', function (e) {
    if (!isDevtoolsKey(e)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    go();
  }, true);

  check();
  if (done) return;
  // пристыкованная панель меняет размер окна сразу при открытии
  addEventListener('resize', function () {
    if (!done && bySize()) go();
  });
  setInterval(check, delay);
})();
