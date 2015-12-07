/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
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
exports['default'] = isExportsOrModuleAssignment;

var _expressionTo = require('./expressionTo');

var expressionTo = _interopRequireWildcard(_expressionTo);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var types = _recast2['default'].types.namedTypes;

/**
 * Returns true if the expression is of form `exports.foo = ...;` or
 * `modules.exports = ...;`.
 */

function isExportsOrModuleAssignment(path) {
  if (types.ExpressionStatement.check(path.node)) {
    path = path.get('expression');
  }
  if (!types.AssignmentExpression.check(path.node) || !types.MemberExpression.check(path.node.left)) {
    return false;
  }

  var exprArr = expressionTo.Array(path.get('left'));
  return exprArr[0] === 'module' && exprArr[1] === 'exports' || exprArr[0] === 'exports';
}

module.exports = exports['default'];