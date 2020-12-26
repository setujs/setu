var GInstanceFields = {},
  GInstanceFieldsCounter = 0

function ifields__getter(field) {
  /**
   * For any given instance field say 'xyz', there is a storage
   * attribute (to be used internally only) to support its getter
   * and setter. The value of this internal attribute is returned
   * by the getter function
  */
  return function() {
    return GInstanceFields[imeta__get(this).$i[field]]
  }
}

function ifields__setter(field) {
  /**
   * The value of the internal storage attribute corresponding to
   * the given field is overwritten with the new value. Also, in
   * case the older value was changed, an event related to instance
   * change is fired. This is not done in case the instance is not
   * created at, where the setter would be called when the instance
   * fields are being populated. Also, if it's explicitly marked
   * to not fire an event on change, then also the event firing is
   * skippped.
  */
  return function(newVal) {
    var imeta = imeta__get(this),
      counter = imeta.$i[field],
      oldVal = GInstanceFields[counter]
    if(oldVal !== newVal) {
      if(!imeta.$d || imeta.$s) {
        GInstanceFields[counter] = newVal
        return
      }
      imeta.$c[field] = {oldVal: oldVal, newVal: newVal}
    } else {
      delete imeta.$c[field]
    }
  }
}

function ifields__set(value) {
  GInstanceFields[GInstanceFieldsCounter] = value
  return GInstanceFieldsCounter++
}

function ifields__count() {
  return Object.keys(GInstanceFields).length
}

function ifields__delete(idx) {
  delete GInstanceFields[idx]
}
