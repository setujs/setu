function details__registerEvents(detail) {
  if (!detail.registered) {
    var key = imeta__get(detail.value).$k
    events__registerFrom(ns.EVENT_INSTANCE_CHANGE, key,
      __details__onInstanceChange, detail)
    events__registerFrom(ns.EVENT_INSTANCE_DELETE, key,
      __details__onInstanceDelete, detail)
    detail.registered = true
  }
}

function details__unregisterEvents(detail) {
  if (detail.registered) {
    var key = imeta__get(detail.value).$k
    events__unregisterFrom(ns.EVENT_INSTANCE_CHANGE, key, detail)
    events__unregisterFrom(ns.EVENT_INSTANCE_DELETE, key, detail)
    detail.registered = false
  }
}

function __details__onInstanceChange(detail, instance, data) {
  events__fireTo(ns.EVENT_DETAIL_RESOURCE_CHANGE, detail.key, detail,
    data)
}

function __details__onInstanceDelete(detail) {
  events__fireTo(ns.EVENT_DETAIL_RESOURCE_DELETE, detail.key, detail)
}

ns.reloadDetail = res__reloadDetail
