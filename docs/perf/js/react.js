var tests = {
  react : { count : 0, time : 0 },
}

document.addEventListener("DOMContentLoaded", function() {
  _react();
});

function _react() {
  var Class = React.createClass({
    select: function(data) {
      this.props.selected = data.id;
      this.forceUpdate();
    },
    render: function() {
      var items = [];
      for (var i = 0; i < this.props.data.length; i++) {
        items.push(React.createElement("div", {
          className: "row"
        }, React.createElement("div", {
          className: this.props.selected ===
            this.props.data[i].id ?
            "selected" : "",
          onClick: this.select.bind(null, this.props.data[i])
        }, this.props.data[i].label)));
      }
      return React.createElement("div", null, items);
    }
  });
  var runReact = document.getElementById("run-react");
  runReact.addEventListener("click", function() {
    var data = _buildData(),
      date = new Date();
    React.render(new Class({
      data: data,
      selected: null
    }), document.getElementById("react"));
    var time = (new Date() - date)
    tests.react.time += time
    ++tests.react.count
    var avg = Math.ceil(tests.react.time / tests.react.count)
    runReact.innerHTML = time + 'ms (avg: ' + avg + 'ms)'
  });
}
