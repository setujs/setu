function listmodifiers__setupListPageSize(element) {
  var list = listmodifiers__checkElement(element, META_PAGESIZE),
    pageSizeParam = Setu.pageSizeParam || Setu.PAGE_SIZE_PARAM
  $_(element).onchange(function(){
    listmodifiers__modifyListGoToPageOne(list, pageSizeParam,
      parseInt($_(element).value(), 10))
  })
  listmodifiers__setInput(list, element, pageSizeParam)
}

function listmodifiers__setupListPageSet(element) {
  var list = listmodifiers__checkElement(element, META_PAGESET),
    pageSizeParam = Setu.pageSizeParam || Setu.PAGE_SIZE_PARAM,
    pageParam = Setu.pageParam || Setu.PAGE_PARAM,
    begin = 1 < list.page ? 1 : null,
    prevPrev = (2 < list.page ? list.page - 2 : null),
    prev = (1 < list.page ? list.page - 1 : null),
    next = (!list.last ? list.page + 1 : null),
    nextNext = (
      !list.last && list.count > (1+list.page)*list.value.length
      ? list.page + 2
      : null),
    end = (
      !list.last
      ? (list.count % list.value.length
        ? (list.count / list.value.length) + 1
        : list.count / list.value.length)
      : null),
    html = ''
  html += begin ? '<a begin-sym enabled page=1>&laquo;</a>' : '<a begin-sym disabled>&laquo;</a>'
  html += prev ? '<a prev-sym enabled page='+prev+'>&lt;</a>' : '<a prev-sym disabled>&lt;</a>'
  html += prevPrev ? '<a prev-prev enabled page='+prevPrev+'>'+prevPrev+'</a>' : ''
  html += prev ? '<a prev enabled page='+prev+'>'+prev+'</a>' : ''
  html += '<a current disabled>' + list.page + '</a>'
  html += next ? '<a next enabled page='+next+'>'+next+'</a>' : ''
  html += nextNext ? '<a next-next enabled page='+nextNext+'>'+nextNext+'</a>' : ''
  html += next ? '<a next-sym enabled page='+next+'>&gt;</a>' : '<a next-sym disabled>&gt;</a>'
  html += end ? '<a end-sym enabled page='+end+'>&raquo;</a>' : '<a end-sym disabled>&raquo;</a>'
  element.querySelectorAll('a').forEach(function(pageLink){
    pageLink.parentNode.removeChild(pageLink)
  })
  observer__stop()
  $_(element).append(html)
  observer__monitor(GAppElement)
  element.querySelectorAll('a[enabled][page]')
  .forEach(function(pageLink){
    $_(pageLink).onclick(function(e){
      var page = parseInt(pageLink.getAttribute('page'), 10)
      list.params = list.params || {}
      list.params[pageParam] = page
      res__buildQueryParams(list)
      lists__reloadOnChange(list)
    })
  })
}

function listmodifiers__setupListFilter(element) {
  var list = listmodifiers__checkElement(element, META_FILTER)
  if(!element.hasAttribute(FILTER_PARAM)) {
    consoleError('Setu.list-modifiers ! invalid meta: no', FILTER_PARAM,
      META_FILTER, element)
    throw new Error(MSG_INVALID_META)
  }
  var param = element.getAttribute(FILTER_PARAM)
  $_(element).onchange(function(){
    listmodifiers__modifyListGoToPageOne(list, param, $_(element).value())
  })
}

function listmodifiers__setupFilters() {
  app__descendents('['+META_FILTER+']['+FILTER_PARAM+']')
  .forEach(function(element){
    var list = listmodifiers__checkElement(element, META_FILTER),
      param = element.getAttribute(FILTER_PARAM)
    listmodifiers__setInput(list, element, param)
  })
}

function listmodifiers__modifyListGoToPageOne(list, param, value) {
  console.debug('Setu.list-modifiers @p1', list, param, value)
  var pageParam = Setu.pageParam || Setu.PAGE_PARAM
  list.params = list.params || {}
  if(value) {
    list.params[param] = value
  } else {
    delete list.params[param]
  }
  delete list.params[pageParam] // reset page to 1
  res__buildQueryParams(list)
  lists__reloadOnChange(list)
}

function listmodifiers__setInput(list, element, param) {
  if(list.params[param]) {
    $_(element).value(list.params[param].toString())
  } else if('select' === element.tagName.toLowerCase()) {
    forms__fixSelect(element)
  }
}

function listmodifiers__checkElement(element, attr) {
  var res = syn__parseResList(element, attr),
    list
  if(1 !== res.length) {
    consoleError('Setu.list-modifiers ! invalid meta', attr, element)
    throw new Error(MSG_INVALID_META)
  }
  if(!(list = res__getByKey(res[0].key))) {
    consoleError('Setu.list-modifiers ! resource not available', attr, element, res)
    throw new Error(MSG_INTERNAL_ERROR)
  }
  if(KW_LIST !== list.type) {
    consoleError('Setu.list-modifiers ! resource is not a list', attr, element, list)
    throw new Error(MSG_INVALID_META)
  }
  return list
}
