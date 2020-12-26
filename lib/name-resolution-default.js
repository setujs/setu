ns.models = {}

ns.models.NameResolutionDefault = {

  m2p: function(name) {
    /**
     * Converts model 'Test' to path 'tests', and 'TestQuestionAnswer'
     * to 'test-question-answers'
    */
    return (
      name.replace(/^([A-Z])/, function(v) {
        return v.toLowerCase()
      })
      .replace(/([A-Z])/g, function(v) {
        return '-' + v.toLowerCase()
      }) +
      's')
  },

  p2m: function(name) {
    /**
     * Reverses what m2p does
    */
    return (
      name.replace(/^([a-z])/, function(v) {
        return v.toUpperCase()
      })
      .replace(/(-[a-z])/g, function(v) {
        return v.charAt(1).toUpperCase()
      })
      .replace(/s$/, ''))
  },

  m2i: function(name) {
    /**
     * Maps model 'Test' to its instance variable name 'test', and
     * 'TestQuestionAnswer' to 'test_question_answer'
    */
    return (
      name.replace(/^([A-Z])/, function(v) {
        return v.toLowerCase()
      })
      .replace(/([A-Z])/g, function(v) {
        return '_' + v.toLowerCase()
      }))
  },

  i2m: function(name) {
    /**
     * Reverses what m2i does
    */
    return (
      name.replace(/^([a-z])/, function(v) {
        return v.toUpperCase()
      })
      .replace(/(_[a-z])/g, function(v) {
        return v.charAt(1).toUpperCase()
      }))
  },

  m2l: function(name) {
    /**
     * Maps model 'Test' to its list variable name 'tests', and
     * 'TestQuestionAnswer' to 'test_question_answers'
    */
    return (this.m2i(name) + 's')
  },

  l2m: function(name) {
    /**
     * Reverses what m2l does
    */
    return (this.i2m(name).replace(/s$/, ''))
  }
}
