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

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = displayNameHandler;

var _utilsGetMemberValuePath = require('../utils/getMemberValuePath');

var _utilsGetMemberValuePath2 = _interopRequireDefault(_utilsGetMemberValuePath);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

var types = _recast2['default'].types.namedTypes;

function displayNameHandler(documentation, path) {
  var displayNamePath = (0, _utilsGetMemberValuePath2['default'])(path, 'displayName');
  if (!displayNamePath) {
    return;
  }
  displayNamePath = (0, _utilsResolveToValue2['default'])(displayNamePath);
  if (!displayNamePath || !types.Literal.check(displayNamePath.node)) {
    return;
  }
  documentation.set('displayName', displayNamePath.node.value);
}

module.exports = exports['default'];