#!/usr/bin/env node

'use strict'

const
  path = require('path'),
  fs = require('fs'),
  beautify = require('js-beautify').js_beautify,
  uglifyJs = require('uglify-js'),
  pkgJson = require(path.resolve(__dirname, '../package.json')),
  targetFile = path.resolve(__dirname, '../setu-' + pkgJson.version + '.js'),
  targetMinFile = path.resolve(__dirname, '../setu-' + pkgJson.version + '.min.js'),
  orderFile = path.resolve(__dirname, '../lib/.order'),
  order = fs.readFileSync(orderFile, 'utf8').trim().split('\n'),
  pluginsOrderFile = path.resolve(__dirname, '../lib/plugins/.order'),
  pluginsOrder = fs.readFileSync(pluginsOrderFile, 'utf8').trim().split('\n')

console.log('adding header...')
fs.writeFileSync(targetFile, "(/* eslint-disable complexity */ /* eslint-disable max-statements */ /* eslint-disable no-shadow-restricted-names */\nfunction(ns, undefined) {\n/* eslint-enable complexity */ /* eslint-enable max-statements */ /* eslint-enable no-shadow-restricted-names */")

console.log('writing sources...')
order.forEach(src => {
  console.log('adding src %s', src)
  fs.appendFileSync(targetFile, '\n' + fs.readFileSync(path.resolve(__dirname, '../' + src)))
})

console.log('adding footer...')
fs.appendFileSync(targetFile, '\n}(window.Setu = window.Setu || {}))\n')

console.log('adding plugins...')
pluginsOrder.forEach(src => {
  console.log('adding plugin src %s', src)
  fs.appendFileSync(targetFile, '\n' + fs.readFileSync(path.resolve(__dirname, '../' + src)))
})

console.log('beautifying...')
let jsContent = beautify(fs.readFileSync(targetFile, 'utf8'), {
    "indent_size": 2
})
    /*"indent_char": " ",
    "indent_with_tabs": false,
    "eol": "\n",
    "end_with_newline": false,
    "indent_level": 0,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "space_in_paren": false,
    "space_in_empty_paren": false,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "brace_style": "collapse",
    "break_chained_methods": false,
    "keep_array_indentation": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "e4x": false,
    "comma_first": false,
    "operator_position": "before-newline"*/

console.log('writing target file...')
fs.writeFileSync(targetFile, jsContent)

console.log('minifying js...')
let jsMinifyResult = uglifyJs.minify(jsContent, {
  mangle: { toplevel: true, eval: true },
  compress: { properties: true, dead_code: true, drop_debugger: true, conditionals: true, comparisons: true, evaluate: true, booleans: true, loops: true, unused: true, hoist_funs: true, if_return: true, join_vars: true, negate_iife: true, drop_console: true }
})
if(jsMinifyResult.error) {
  console.error('failed min js', jsMinifyResult.error)
  fs.writeFileSync(targetMinFile, '')
}
else {
  console.log('writing min js %s...', targetMinFile)
  fs.writeFileSync(targetMinFile, jsMinifyResult.code)
}
