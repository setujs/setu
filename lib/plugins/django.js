$_.ready(function() {
  Setu.adapters['Django'] = [{
    purpose: Setu.ADAPTER_AJAX_BEFORE_SEND,
    handler: function(ignore, xhr, options, context) {
      if(!/^(GET|HEAD|OPTIONS|TRACE)$/.test(options.method) && !
        context.crossDomain) {
        var csrfToken = document.cookie.match(new RegExp(
          'csrftoken=([^;]+)'));
        if(csrfToken) {
          xhr.setRequestHeader('X-CSRFToken', csrfToken[1])
          console.debug('DjangoAdapter', 'added X-CSRFToken header',
            csrfToken[1])
        }
      }
    }
  }, {
    purpose: Setu.ADAPTER_FILTER_VALUE,
    handler: function(ignore, value) {
      switch(value){
        case 'True': return 'true'
        case 'False': return 'false'
        case 'None': return 'null'
        default: return value
      }
    }
  }]
})
