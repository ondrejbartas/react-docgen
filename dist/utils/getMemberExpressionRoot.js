/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = getMemberExpressionRoot;

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var types = _recast2['default'].types.namedTypes;

/**
 * Returns the path to the first part of the MemberExpression. I.e. given a
 * path representing
 *
 * foo.bar.baz
 *
 * it returns the path of/to `foo`.
 */

function getMemberExpressionRoot(memberExpressionPath) {
  do {
    memberExpressionPath = memberExpressionPath.get('object');
  } while (types.MemberExpression.check(memberExpressionPath.node));
  return memberExpressionPath;
}

module.exports = exports['default'];