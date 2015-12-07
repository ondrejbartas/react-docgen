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

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = normalizeClassDefinition;

var _utilsGetMemberExpressionRoot = require('../utils/getMemberExpressionRoot');

var _utilsGetMemberExpressionRoot2 = _interopRequireDefault(_utilsGetMemberExpressionRoot);

var _utilsGetMembers = require('../utils/getMembers');

var _utilsGetMembers2 = _interopRequireDefault(_utilsGetMembers);

var _recast = require('recast');

var _recast2 = _interopRequireDefault(_recast);

var _recast$types = _recast2['default'].types;
var types = _recast$types.namedTypes;
var builders = _recast$types.builders;

var ignore = function ignore() {
  return false;
};

/**
 * Given a class definition (i.e. `class` declaration or expression), this
 * function "normalizes" the definition, by looking for assignments of static
 * properties and converting them to ClassProperties.
 *
 * Example:
 *
 * class MyComponent extends React.Component {
 *   // ...
 * }
 * MyComponent.propTypes = { ... };
 *
 * is converted to
 *
 * class MyComponent extends React.Component {
 *   // ...
 *   static propTypes = { ... };
 * }
 */

function normalizeClassDefinition(classDefinition) {
  var variableName;
  if (types.ClassDeclaration.check(classDefinition.node)) {
    variableName = classDefinition.node.id.name;
  } else if (types.ClassExpression.check(classDefinition.node)) {
    var parentPath = classDefinition.parentPath;

    while (parentPath.node !== classDefinition.scope.node && !types.BlockStatement.check(parentPath.node)) {
      if (types.VariableDeclarator.check(parentPath.node) && types.Identifier.check(parentPath.node.id)) {
        variableName = parentPath.node.id.name;
        break;
      } else if (types.AssignmentExpression.check(parentPath.node) && types.Identifier.check(parentPath.node.left)) {
        variableName = parentPath.node.left.name;
        break;
      }
      parentPath = parentPath.parentPath;
    }
  }

  if (!variableName) {
    return;
  }

  var scopeRoot = classDefinition.scope;
  _recast2['default'].visit(scopeRoot.node, {
    visitFunction: ignore,
    visitClassDeclaration: ignore,
    visitClassExpression: ignore,
    visitForInStatement: ignore,
    visitForStatement: ignore,
    visitAssignmentExpression: function visitAssignmentExpression(path) {
      if (types.MemberExpression.check(path.node.left)) {
        var first = (0, _utilsGetMemberExpressionRoot2['default'])(path.get('left'));
        if (types.Identifier.check(first.node) && first.node.name === variableName) {
          var _getMembers = (0, _utilsGetMembers2['default'])(path.get('left'));

          var _getMembers2 = _slicedToArray(_getMembers, 1);

          var member = _getMembers2[0];

          if (member && !member.path.node.computed) {
            var classProperty = builders.classProperty(member.path.node, path.node.right, null, true);
            classDefinition.get('body', 'body').value.push(classProperty);
            return false;
          }
        }
        this.traverse(path);
      } else {
        return false;
      }
    }
  });
}

module.exports = exports['default'];