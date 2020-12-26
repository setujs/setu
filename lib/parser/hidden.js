var GHidden = []

function hidden__clear() {
  GHidden = []
}

function hidden__add(node) {
  GHidden.push(node)
}

function hidden__all() {
  return GHidden
}

function hidden__replace(hidden) {
  GHidden = hidden
}
