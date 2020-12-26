$_.ready(function() {
  function isArray(v) {
    return ('[object Array]' === Object.prototype.toString.call(v))
  }
  function isObject(v) {
    return ('object' === typeof(v) && !isArray(v))
  }
  function findPage(url, pageParam) {
    var params = url.replace(/^[^\?]*\?/,'').split('&'), page = 1
    for(var idx = 0; idx < params.length; ++idx) {
      var param = params[idx],
        parts = param.split('=')
      if(pageParam === parts[0]){
        page = parseInt(parts[1], 10)  
        break
      }
    }
    return page
  }
  Setu.adapters['DjangoRestFramework'] = [{
    purpose: Setu.ADAPTER_MODELS_LIST,
    handler: function(ignore, response) {
        data = response.data
      if(isObject(data)) {
        var pageParam = Setu.pageParam || Setu.PAGE_PARAM,
          page, last = false
        if(data.next) {
          page = findPage(data.next, pageParam) - 1
        } else if(data.previous) {
          page = findPage(data.previous, pageParam) + 1
          last = true
        } else {
          page = 1
          last = true
        }
        return {
          page: page,
          last: last,
          count: data.count,
          list: data.results
        }
      } else if(isArray(data)) {
        return {
          page: 1,
          last: true,
          count: data.length,
          list: data
        }
      }
    }
  }]
})
