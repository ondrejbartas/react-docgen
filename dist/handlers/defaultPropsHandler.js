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
exports['default'] = defaultPropsHandler;

var _utilsGetPropertyName = require('../utils/getPropertyName');

var _utilsGetPropertyName2 = _interopRequireDefault(_utilsGetPropertyName);

var _utilsGetMemberValuePath = require('../utils/getMemberValuePath');

var _utilsGetMemberValuePath2 = _interopRequireDefault(_utilsGetMemberValuePath);

var _utilsPrintValue = require('../utils/printValue');

var _utilsPrintValue2 = _interopRequireDefault(_utilsPrintValue);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

var _recast$types = _recast2['default'].types;
var types = _recast$types.namedTypes;
var visit = _recast$types.visit;

function getDefaultValue(path) {
  var node = path.node;
  var defaultValue;
  if (types.Literal.check(node)) {
    defaultValue = node.raw;
  } else {
    path = (0, _utilsResolveToValue2['default'])(path);
    node = path.node;
    defaultValue = (0, _utilsPrintValue2['default'])(path);
  }
  if (typeof defaultValue !== 'undefined') {
    return {
      value: defaultValue,
      computed: types.CallExpression.check(node) || types.MemberExpression.check(node) || types.Identifier.check(node)
    };
  }
}

function defaultPropsHandler(documentation, componentDefinition) {
  var defaultPropsPath = (0, _utilsGetMemberValuePath2['default'])(componentDefinition, 'defaultProps');
  if (!defaultPropsPath) {
    return;
  }

  if (types.FunctionExpression.check(defaultPropsPath.node)) {
    // Find the value that is returned from the function and process it if it is
    // an object literal.
    visit(defaultPropsPath.get('body'), {
      visitFunction: function visitFunction() {
        return false;
      },
      visitReturnStatement: function visitReturnStatement(path) {
        var resolvedPath = (0, _utilsResolveToValue2['default'])(path.get('argument'));
        if (types.ObjectExpression.check(resolvedPath.node)) {
          defaultPropsPath = resolvedPath;
        }
        return false;
      }
    });
  }

  if (types.ObjectExpression.check(defaultPropsPath.node)) {
    defaultPropsPath.get('properties').filter(function (propertyPath) {
      return types.Property.check(propertyPath.node);
    }).forEach(function (propertyPath) {
      var propDescriptor = documentation.getPropDescriptor((0, _utilsGetPropertyName2['default'])(propertyPath));
      var defaultValue = getDefaultValue(propertyPath.get('value'));
      if (defaultValue) {
        propDescriptor.defaultValue = defaultValue;
      }
    });
  }
}

module.exports = exports['default'];