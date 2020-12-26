var
  GEventsConsumers = {},
  GEventsKeyedConsumers = {}

GEventsConsumers[ns.EVENT_LIST_RESOURCE_CREATE] = []
GEventsConsumers[ns.EVENT_FORM_SUCCESS] = []
GEventsConsumers[ns.EVENT_FORM_ERROR] = []
GEventsConsumers[ns.EVENT_AJAX_ERROR] = []
GEventsConsumers[ns.EVENT_PAGE_RENDER] = []
GEventsConsumers[ns.EVENT_PAGE_BEGIN] = []
GEventsConsumers[ns.EVENT_META_RENDER] = []
GEventsConsumers[ns.EVENT_FRAGMENT_CHANGE] = []

GEventsKeyedConsumers[ns.EVENT_DETAIL_RESOURCE_CHANGE] = {}
GEventsKeyedConsumers[ns.EVENT_DETAIL_RESOURCE_DELETE] = {}
GEventsKeyedConsumers[ns.EVENT_INSTANCE_CHANGE] = {}
GEventsKeyedConsumers[ns.EVENT_INSTANCE_CREATE] = {}
GEventsKeyedConsumers[ns.EVENT_INSTANCE_DELETE] = {}
GEventsKeyedConsumers[ns.EVENT_LIST_RESOURCE_CHANGE] = {}
GEventsKeyedConsumers[ns.EVENT_LIST_RESOURCE_DELETE] = {}

/**
 * Event registries (non-keyed and keyed) look as follows:
 * [cookie0, handler0, cookie1, handler1, cookie2, handler2, ...]
*/


function events__register(type, handler, cookie) {
  if(!GEventsConsumers[type].contains(cookie)) {
    GEventsConsumers[type].push(cookie)
    GEventsConsumers[type].push(handler)
    console.debug('Setu.events +', type, cookie, handler)
  }
}

function events__registerFrom(type, key, handler, cookie) {
  GEventsKeyedConsumers[type][key] = GEventsKeyedConsumers[type][key] || []
  if(!GEventsKeyedConsumers[type][key].contains(cookie)) {
    GEventsKeyedConsumers[type][key].push(cookie)
    GEventsKeyedConsumers[type][key].push(handler)
    console.debug('Setu.events +', type, key, cookie, handler)
  }
}

function events__fire(type, producer, data) {
  /**
   * An event subscriber can unsubscribe within the event handler.
   * Hence a copy of the registry array is used for calling all the
   * registered handlers.
  */
  var registry = GEventsConsumers[type].slice()
  for(var i = 0; i < registry.length; i += 2) {
    /**
     * Event handlers may throw exceptions. That should not prevent
     * calling all subsequent event handlers. Hence, all exceptions
     * are intercepted.
    */
    try {
      console.info('Setu.events -->', type, producer, data, registry[i],
        registry[i + 1])
      /**
       * The event handler is called as follows:
       * handler(cookie, producer, data)
      */
      registry[i+1](registry[i], producer, data)
    } catch(e) {
      console.warn('Setu.events !', type, producer, data, e.message, e.stack)
    }
  }
}

function events__fireTo(type, key, producer, data) {
  var registry = GEventsKeyedConsumers[type][key]
  if(registry) {
    registry = registry.slice()
    for(var i = 0; i < registry.length; i += 2) {
      try {
        console.info('Setu.events -->', type, key, producer, data, registry[i],
          registry[i + 1])
        registry[i+1](registry[i], producer, data)
      } catch(e) {
        console.warn('Setu.events !', type, key, producer, data, e.message, e.stack)
      }
    }
  }
}

function events__unregister(type, cookie) {
  GEventsConsumers[type].remove(cookie, 2)
  console.debug('Setu.events x', type, cookie)
}

function events__unregisterFrom(type, key, cookie) {
  var registry = GEventsKeyedConsumers[type][key]
  if(registry) {
    registry.remove(cookie, 2)
    console.debug('Setu.events x', type, key, cookie)
  }
}

ns.register = events__register
ns.unregister = events__unregister
