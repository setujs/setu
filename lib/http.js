var GHttpGetQueue = {}

function http__clear() {
  GHttpGetQueue = {}
}

function __http__ajax(method, url, options, onsuccess, onerror) {
  options = options || {}
  options.method = method || METHOD_GET
  options.cache = options.cache || false
  options.beforeSend = options.beforeSend || function (xhr, settings) {
    __http__ajaxStart()
    adapters__run(ns.ADAPTER_AJAX_BEFORE_SEND, xhr, settings, this)
  }
  __http__setupSuccessFn(options, url, method, onsuccess)
  __http__setupErrorFn(options, url, method, onerror)
  console.debug('Setu.http -->', url, options)
  $_.ajax(url, options)
}

function __http__setupSuccessFn(options, origUrl, method, onsuccess) {
  options.success = function(data, status, url, xhr) {
    console.info('Setu.http ajax $', url, method, status, data)
    __http__ajaxEnd()
    try {
      adapters__run(ns.ADAPTER_AJAX_ON_RESPONSE, data, status, url, xhr)
    } catch (e) {
      console.warn('Setu.http ! success adapters__run', e.message, e.stack)
    }
    try {
      if ('function' === typeof(onsuccess)) {
        onsuccess({data: data, status: status, xhr: xhr, url: url})
      }
      if(METHOD_GET === method && origUrl in GHttpGetQueue) {
        GHttpGetQueue[origUrl].forEach(function(fetcher){
          if('function' === typeof(fetcher.onsuccess)) {
            fetcher.onsuccess({data: data, status: status, xhr: xhr, url: url})
          }
        })
        delete GHttpGetQueue[origUrl]
      }
    } catch(e) {
      consoleError('Setu.http ! error onsuccess', e.message, e.stack)
      if(METHOD_GET === method) {
        delete GHttpGetQueue[origUrl]
      }
    }
  }
}

function __http__setupErrorFn(options, origUrl, method, onerror) {
  options.error = function(err, status, url, xhr) {
    consoleError('Setu.http ajax !', url, method, status, err)
    __http__ajaxEnd()
    try {
      adapters__run(ns.ADAPTER_AJAX_ON_RESPONSE, err, status, url, xhr)
    } catch (e) {
      console.warn('Setu.http ! error adapters__run', e.message, e.stack)
    }
    var jsonStr = JSON.stringify({status: status, error: err, url: url})
    try {
      if ('function' === typeof(onerror)) {
        onerror(Error(jsonStr))
      }
      if(METHOD_GET === method && origUrl in GHttpGetQueue) {
        GHttpGetQueue[origUrl].forEach(function(fetcher){
          if('function' === typeof(fetcher.onerror)) {
            fetcher.onerror(Error(jsonStr))
          }
        })
        delete GHttpGetQueue[origUrl]
      }
    } catch(e) {
      consoleError('Setu.http ! error onerror', e.message, e.stack)
      if(METHOD_GET === method) {
        delete GHttpGetQueue[origUrl]
      }
    }
    if('number' !== typeof(status) || status < 400) {
      events__fire(ns.EVENT_AJAX_ERROR, null, {status: status, error: err})
    }
  }
}

function __http__ajaxStart() {
  if('function' === typeof(ns.appAjaxStart)) {
    try {
      ns.appAjaxStart()
    } catch(e) {
      console.warn('Setu.http ! appAjaxStart', e.message, e.stack)
    }
  }
}

function __http__ajaxEnd() {
  if('function' === typeof(ns.appAjaxEnd)) {
    try {
      ns.appAjaxEnd()
    } catch(e) {
      console.warn('Setu.http ! appAjaxEnd', e.message, e.stack)
    }
  }
}

function http__get(url, options, onsuccess, onerror) {
  if(GHttpGetQueue[url]) {
    GHttpGetQueue[url].push({
      onsuccess: onsuccess,
      onerror: onerror
    })
    return
  }
  GHttpGetQueue[url] = []
  __http__ajax(METHOD_GET, url, options, onsuccess, onerror)
}

function http__post(url, options, onsuccess, onerror) {
  __http__ajax(METHOD_POST, url, options, onsuccess, onerror)
}

function http__patch(url, options, onsuccess, onerror) {
  __http__ajax(METHOD_PATCH, url, options, onsuccess, onerror)
}

function http__put(url, options, onsuccess, onerror) {
  __http__ajax(METHOD_PUT, url, options, onsuccess, onerror)
}

function http__delete(url, options, onsuccess, onerror) {
  __http__ajax(METHOD_DELETE, url, options, onsuccess, onerror)
}
