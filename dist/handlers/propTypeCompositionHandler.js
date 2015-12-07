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
exports['default'] = propTypeCompositionHandler;

var _utilsGetMemberValuePath = require('../utils/getMemberValuePath');

var _utilsGetMemberValuePath2 = _interopRequireDefault(_utilsGetMemberValuePath);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _utilsResolveToModule = require('../utils/resolveToModule');

var _utilsResolveToModule2 = _interopRequireDefault(_utilsResolveToModule);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

var types = _recast2['default'].types.namedTypes;

/**
 * It resolves the path to its module name and adds it to the "composes" entry
 * in the documentation.
 */
function amendComposes(documentation, path) {
  var moduleName = (0, _utilsResolveToModule2['default'])(path);
  if (moduleName) {
    documentation.addComposes(moduleName);
  }
}

function processObjectExpression(documentation, path) {
  path.get('properties').each(function (propertyPath) {
    switch (propertyPath.node.type) {
      case types.SpreadProperty.name:
        var resolvedValuePath = (0, _utilsResolveToValue2['default'])(propertyPath.get('argument'));
        amendComposes(documentation, resolvedValuePath);
        break;
    }
  });
}

function propTypeCompositionHandler(documentation, path) {
  var propTypesPath = (0, _utilsGetMemberValuePath2['default'])(path, 'propTypes');
  if (!propTypesPath) {
    return;
  }
  propTypesPath = (0, _utilsResolveToValue2['default'])(propTypesPath);
  if (!propTypesPath) {
    return;
  }

  switch (propTypesPath.node.type) {
    case types.ObjectExpression.name:
      processObjectExpression(documentation, propTypesPath);
      break;
    default:
      amendComposes(documentation, propTypesPath);
      break;
  }
}

module.exports = exports['default'];