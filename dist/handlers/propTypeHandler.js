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
exports['default'] = propTypeHandler;

var _utilsGetPropType = require('../utils/getPropType');

var _utilsGetPropType2 = _interopRequireDefault(_utilsGetPropType);

var _utilsGetPropertyName = require('../utils/getPropertyName');

var _utilsGetPropertyName2 = _interopRequireDefault(_utilsGetPropertyName);

var _utilsGetMemberValuePath = require('../utils/getMemberValuePath');

var _utilsGetMemberValuePath2 = _interopRequireDefault(_utilsGetMemberValuePath);

var _utilsIsReactModuleName = require('../utils/isReactModuleName');

var _utilsIsReactModuleName2 = _interopRequireDefault(_utilsIsReactModuleName);

var _utilsIsRequiredPropType = require('../utils/isRequiredPropType');

var _utilsIsRequiredPropType2 = _interopRequireDefault(_utilsIsRequiredPropType);

var _utilsPrintValue = require('../utils/printValue');

var _utilsPrintValue2 = _interopRequireDefault(_utilsPrintValue);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _utilsResolveToModule = require('../utils/resolveToModule');

var _utilsResolveToModule2 = _interopRequireDefault(_utilsResolveToModule);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

var types = _recast2['default'].types.namedTypes;

function isPropTypesExpression(path) {
  var moduleName = (0, _utilsResolveToModule2['default'])(path);
  if (moduleName) {
    return (0, _utilsIsReactModuleName2['default'])(moduleName) || moduleName === 'ReactPropTypes';
  }
  return false;
}

function amendPropTypes(documentation, path) {
  path.get('properties').each(function (propertyPath) {
    switch (propertyPath.node.type) {
      case types.Property.name:
        var propDescriptor = documentation.getPropDescriptor((0, _utilsGetPropertyName2['default'])(propertyPath));
        var valuePath = propertyPath.get('value');
        var type = isPropTypesExpression(valuePath) ? (0, _utilsGetPropType2['default'])(valuePath) : { name: 'custom', raw: (0, _utilsPrintValue2['default'])(valuePath) };

        if (type) {
          propDescriptor.type = type;
          propDescriptor.required = type.name !== 'custom' && (0, _utilsIsRequiredPropType2['default'])(valuePath);
        }
        break;
      case types.SpreadProperty.name:
        var resolvedValuePath = (0, _utilsResolveToValue2['default'])(propertyPath.get('argument'));
        switch (resolvedValuePath.node.type) {
          case types.ObjectExpression.name:
            // normal object literal
            amendPropTypes(documentation, resolvedValuePath);
            break;
        }
        break;
    }
  });
}

function propTypeHandler(documentation, path) {
  var propTypesPath = (0, _utilsGetMemberValuePath2['default'])(path, 'propTypes');
  if (!propTypesPath) {
    return;
  }
  propTypesPath = (0, _utilsResolveToValue2['default'])(propTypesPath);
  if (!propTypesPath) {
    return;
  }
  amendPropTypes(documentation, propTypesPath);
}

module.exports = exports['default'];