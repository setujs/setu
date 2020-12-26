var tests = {
  angular : { count : 0, time : 0 },
}

_angular();

function _angular(data) {
  angular.module("test", []).controller("controller", function($scope) {
    $scope.run = function() {
      var data = _buildData(),
        date = new Date();
      $scope.selected = null;
      $scope.$$postDigest(function() {
        var time = (new Date() - date)
        tests.angular.time += time
        ++tests.angular.count
        var avg = Math.ceil(tests.angular.time / tests.angular.count)
        document.getElementById("run-angular").innerHTML =
          time + 'ms (avg: ' + avg + 'ms)'
      });
      $scope.data = data;
    };
    $scope.select = function(item) {
      $scope.selected = item.id;
    };
  });
}
