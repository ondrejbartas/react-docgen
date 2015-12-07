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
exports['default'] = findAllReactCreateClassCalls;

var _utilsIsReactComponentClass = require('../utils/isReactComponentClass');

var _utilsIsReactComponentClass2 = _interopRequireDefault(_utilsIsReactComponentClass);

var _utilsIsReactCreateClassCall = require('../utils/isReactCreateClassCall');

var _utilsIsReactCreateClassCall2 = _interopRequireDefault(_utilsIsReactCreateClassCall);

var _utilsIsStatelessComponent = require('../utils/isStatelessComponent');

var _utilsIsStatelessComponent2 = _interopRequireDefault(_utilsIsStatelessComponent);

var _utilsNormalizeClassDefinition = require('../utils/normalizeClassDefinition');

var _utilsNormalizeClassDefinition2 = _interopRequireDefault(_utilsNormalizeClassDefinition);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

/**
 * Given an AST, this function tries to find all object expressions that are
 * passed to `React.createClass` calls, by resolving all references properly.
 */

function findAllReactCreateClassCalls(ast, recast) {
  var types = recast.types.namedTypes;
  var definitions = [];

  function classVisitor(path) {
    if ((0, _utilsIsReactComponentClass2['default'])(path)) {
      (0, _utilsNormalizeClassDefinition2['default'])(path);
      definitions.push(path);
    }
    return false;
  }

  function statelessVisitor(path) {
    if ((0, _utilsIsStatelessComponent2['default'])(path)) {
      definitions.push(path);
    }
    return false;
  }

  recast.visit(ast, {
    visitFunctionDeclaration: statelessVisitor,
    visitFunctionExpression: statelessVisitor,
    visitArrowFunctionExpression: statelessVisitor,
    visitClassExpression: classVisitor,
    visitClassDeclaration: classVisitor,
    visitCallExpression: function visitCallExpression(path) {
      if (!(0, _utilsIsReactCreateClassCall2['default'])(path)) {
        return false;
      }
      var resolvedPath = (0, _utilsResolveToValue2['default'])(path.get('arguments', 0));
      if (types.ObjectExpression.check(resolvedPath.node)) {
        definitions.push(resolvedPath);
      }
      return false;
    }
  });

  return definitions;
}

module.exports = exports['default'];