/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 *
 */

'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _handlers = require('./handlers');

var handlers = _interopRequireWildcard(_handlers);

var _parse = require('./parse');

var _parse2 = _interopRequireDefault(_parse);

var _resolver = require('./resolver');

var resolver = _interopRequireWildcard(_resolver);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var defaultResolver = resolver.findExportedComponentDefinition;
var defaultHandlers = [handlers.propTypeHandler, handlers.propTypeCompositionHandler, handlers.propDocBlockHandler, handlers.defaultPropsHandler, handlers.componentDocblockHandler, handlers.displayNameHandler];

/**
 * See `lib/parse.js` for more information about the arguments. This function
 * simply sets default values for convenience.
 *
 * The default resolver looks for *exported* `React.createClass(def)` calls
 * and expected `def` to resolve to an object expression.
 *
 * The default `handlers` look for `propTypes` and `getDefaultProps` in the
 * provided object expression, and extract prop type information, prop
 * documentation (from docblocks), default prop values and component
 * documentation (from a docblock).
 */
function defaultParse( // eslint-disable-line no-unused-vars
src, resolver, // eslint-disable-line no-shadow
handlers // eslint-disable-line no-shadow
) {
  if (!resolver) {
    resolver = defaultResolver;
  }
  if (!handlers) {
    handlers = defaultHandlers;
  }

  return (0, _parse2['default'])(src, resolver, handlers);
}

exports.parse = defaultParse;
exports.defaultHandlers = defaultHandlers;
exports.handlers = handlers;
exports.resolver = resolver;
exports.utils = utils;