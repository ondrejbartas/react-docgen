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
exports['default'] = resolveToValue;

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _recast$types = _recast2['default'].types;
var NodePath = _recast$types.NodePath;
var builders = _recast$types.builders;
var types = _recast$types.namedTypes;

function buildMemberExpressionFromPattern(_x) {
  var _again = true;

  _function: while (_again) {
    var path = _x;
    _again = false;

    var node = path.node;
    if (types.Property.check(node)) {
      var objPath = buildMemberExpressionFromPattern(path.parent);
      if (objPath) {
        return new NodePath(builders.memberExpression(objPath.node, node.key, types.Literal.check(node.key)), objPath);
      }
    } else if (types.ObjectPattern.check(node)) {
      _x = path.parent;
      _again = true;
      node = objPath = undefined;
      continue _function;
    } else if (types.VariableDeclarator.check(node)) {
      return path.get('init');
    }
    return null;
  }
}

/**
 * If the path is an identifier, it is resolved in the scope chain.
 * If it is an assignment expression, it resolves to the right hand side.
 *
 * Else the path itself is returned.
 */

function resolveToValue(_x2) {
  var _again2 = true;

  _function2: while (_again2) {
    var path = _x2;
    _again2 = false;

    var node = path.node;
    if (types.VariableDeclarator.check(node)) {
      if (node.init) {
        _x2 = path.get('init');
        _again2 = true;
        node = undefined;
        continue _function2;
      }
    } else if (types.ImportDefaultSpecifier.check(node) || types.ImportSpecifier.check(node)) {
      return path.parentPath;
    } else if (types.AssignmentExpression.check(node)) {
      if (node.operator === '=') {
        _x2 = node.get('right');
        _again2 = true;
        node = undefined;
        continue _function2;
      }
    } else if (types.Identifier.check(node)) {
      if ((types.ClassDeclaration.check(path.parentPath.node) || types.ClassExpression.check(path.parentPath.node) || types.Function.check(path.parentPath.node)) && path.parentPath.get('id') === path) {
        return path.parentPath;
      }

      var scope = path.scope.lookup(node.name);
      if (scope) {
        var bindings = scope.getBindings()[node.name];
        if (bindings.length > 0) {
          var resultPath = scope.getBindings()[node.name][0];
          var parentPath = resultPath.parent;
          if (types.ImportDefaultSpecifier.check(parentPath.node) || types.ImportSpecifier.check(parentPath.node) || types.VariableDeclarator.check(parentPath.node)) {
            resultPath = parentPath;
          } else if (types.Property.check(parentPath.node)) {
            // must be inside a pattern
            var memberExpressionPath = buildMemberExpressionFromPattern(parentPath);
            if (memberExpressionPath) {
              return memberExpressionPath;
            }
          }
          if (resultPath.node !== path.node) {
            _x2 = resultPath;
            _again2 = true;
            node = scope = bindings = resultPath = parentPath = memberExpressionPath = undefined;
            continue _function2;
          } else {
            return path;
          }
        }
      }
    }
    return path;
  }
}

module.exports = exports['default'];