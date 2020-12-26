var GInstanceMeta = {},
  GInstanceMetaCounter = 0

function imeta__next() {
  return GInstanceMetaCounter++
}

function imeta__new(instance) {
  var imeta = GInstanceMeta[instance.__meta_idx__] = {}
  imeta.$m = models__get(instance.__model__)
  imeta.$i = {}
  imeta.$c = {}
  return imeta
}

function imeta__get(instance) {
  return GInstanceMeta[instance.__meta_idx__]
}

function imeta__count() {
  return Object.keys(GInstanceMeta).length
}

function imeta__setKey(instance, imeta, key) {
  delete GInstanceMeta[instance.__meta_idx__]
  instance.__meta_idx__ = key
  imeta.$k = key
  GInstanceMeta[key] = imeta
}

function imeta__delete(instance) {
  delete GInstanceMeta[instance.__meta_idx__]
}

function imeta__print() {
  console.debug('Instance Meta Counter:', GInstanceMetaCounter)
  console.debug('Number of Instances:', imeta__count())
  for(var key in GInstanceMeta) {
    console.debug('Key', key, 'Instance', GInstanceMeta[key])
  }
}

ns.imeta = imeta__print
