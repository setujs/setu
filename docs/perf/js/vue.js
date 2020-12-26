var tests = {
  vue : { count : 0, time : 0 },
}

document.addEventListener("DOMContentLoaded", function() {
  _setup()
});

var template, globalData

function _setup() {
  template = document.querySelector('#vue-app').innerHTML
}

function run() {
  document.querySelector('#vue-app').innerHTML = template
  globalData = {
    data: _buildData()
  }
  var date = new Date()
  var app = new Vue({
    el: "#vue-app",
    data: globalData,
    mounted: function() {
      this.$nextTick(function() {
        if(1000 === document.querySelectorAll('.row').length) {
          var time = (new Date() - date)
          tests.vue.time += time
          ++tests.vue.count
          var avg = Math.ceil(tests.vue.time / tests.vue.count)
          document.getElementById("run-vue").innerHTML =
            time + 'ms (avg: ' + avg + 'ms)'
        }
      })
    },
  })
}

function selectRow(clicked) {
  var selected = document.querySelector('.selected')
  if(selected) {
    selected.setAttribute('class', '')
  }
  console.debug(this)
  clicked.setAttribute('class', 'selected')
}
