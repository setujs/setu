var tests = {
  knockout : { count : 0, time : 0 },
}

document.addEventListener("DOMContentLoaded", function() {
  _knockout();
});

function _knockout() {
  ko.applyBindings({
    selected: ko.observable(),
    data: ko.observableArray(),
    select: function(item) {
      this.selected(item.id);
    },
    run: function() {
      var data = _buildData(),
        date = new Date();
      this.selected(null);
      this.data(data);
      var time = (new Date() - date)
      tests.knockout.time += time
      ++tests.knockout.count
      var avg = Math.ceil(tests.knockout.time / tests.knockout.count)
      document.getElementById("run-knockout").innerHTML =
        time + 'ms (avg: ' + avg + 'ms)'
    }
  }, document.getElementById("knockout"));
}

ko.observableArray.fn.reset = function(values) {
  var array = this();
  this.valueWillMutate();
  ko.utils.arrayPushAll(array, values);
  this.valueHasMutated();
}
