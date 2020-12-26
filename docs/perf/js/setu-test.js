var tests = {
  setu : { count : 0, time : 0 }
}

document.addEventListener("DOMContentLoaded", function() {
  _setu();
});

function _setu() {
  var template = document.getElementById('setu-template').innerHTML;
  document.getElementById('setu-template').innerHTML = ''
  var date
  function onrender() {
    if(date) {
      var time = (new Date() - date)
      tests.setu.time += time
      ++tests.setu.count
      var avg = Math.ceil(tests.setu.time / tests.setu.count)
      runSetu.innerHTML = time + 'ms (avg: ' + avg + 'ms)'
    }
  }
  Setu.register(Setu.EVENT_META_RENDER, onrender)
  Setu.run('test', { config : { logLevel : 'error' } })
  var runSetu = document.getElementById("run-setu");
  runSetu.addEventListener('click', function(e) {
    Setu.clear()
    var data = _buildData()
    date = new Date();
    Setu.set('data', data)
    document.getElementById('setu-template').innerHTML = template
  })
}

function _select(me) {
  Setu.app.querySelectorAll('div.selected').forEach(function(div) {
    $_(div).removeClass('selected')
  })
  $_(me).addClass('selected')
}
