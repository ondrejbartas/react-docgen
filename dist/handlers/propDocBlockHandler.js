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
exports['default'] = propDocBlockHandler;

var _utilsDocblock = require('../utils/docblock');

var _utilsGetPropertyName = require('../utils/getPropertyName');

var _utilsGetPropertyName2 = _interopRequireDefault(_utilsGetPropertyName);

var _utilsGetMemberValuePath = require('../utils/getMemberValuePath');

var _utilsGetMemberValuePath2 = _interopRequireDefault(_utilsGetMemberValuePath);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

var types = _recast2['default'].types.namedTypes;

function propDocBlockHandler(documentation, path) {
  var propTypesPath = (0, _utilsGetMemberValuePath2['default'])(path, 'propTypes');
  if (!propTypesPath) {
    return;
  }
  propTypesPath = (0, _utilsResolveToValue2['default'])(propTypesPath);
  if (!propTypesPath || !types.ObjectExpression.check(propTypesPath.node)) {
    return;
  }

  propTypesPath.get('properties').each(function (propertyPath) {
    // we only support documentation of actual properties, not spread
    if (types.Property.check(propertyPath.node)) {
      var propDescriptor = documentation.getPropDescriptor((0, _utilsGetPropertyName2['default'])(propertyPath));
      propDescriptor.description = (0, _utilsDocblock.getDocblock)(propertyPath) || '';
    }
  });
}

module.exports = exports['default'];