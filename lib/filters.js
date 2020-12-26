function __filters__datetime(dateStr) {
  return (new Date(dateStr)).toISOString()
}

function filters__exists(filter) {
  return filter in GFilters
}

function filters__run(filter, input) {
  return GFilters[filter](input)
}

var GFilters = {
  datetime: __filters__datetime
}
