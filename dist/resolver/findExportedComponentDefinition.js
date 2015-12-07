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
exports['default'] = findExportedComponentDefinition;

var _utilsIsExportsOrModuleAssignment = require('../utils/isExportsOrModuleAssignment');

var _utilsIsExportsOrModuleAssignment2 = _interopRequireDefault(_utilsIsExportsOrModuleAssignment);

var _utilsIsReactComponentClass = require('../utils/isReactComponentClass');

var _utilsIsReactComponentClass2 = _interopRequireDefault(_utilsIsReactComponentClass);

var _utilsIsReactCreateClassCall = require('../utils/isReactCreateClassCall');

var _utilsIsReactCreateClassCall2 = _interopRequireDefault(_utilsIsReactCreateClassCall);

var _utilsIsStatelessComponent = require('../utils/isStatelessComponent');

var _utilsIsStatelessComponent2 = _interopRequireDefault(_utilsIsStatelessComponent);

var _utilsNormalizeClassDefinition = require('../utils/normalizeClassDefinition');

var _utilsNormalizeClassDefinition2 = _interopRequireDefault(_utilsNormalizeClassDefinition);

var _utilsResolveExportDeclaration = require('../utils/resolveExportDeclaration');

var _utilsResolveExportDeclaration2 = _interopRequireDefault(_utilsResolveExportDeclaration);

var _utilsResolveToValue = require('../utils/resolveToValue');

var _utilsResolveToValue2 = _interopRequireDefault(_utilsResolveToValue);

var ERROR_MULTIPLE_DEFINITIONS = 'Multiple exported component definitions found.';

function ignore() {
  return false;
}

function isComponentDefinition(path) {
  return (0, _utilsIsReactCreateClassCall2['default'])(path) || (0, _utilsIsReactComponentClass2['default'])(path) || (0, _utilsIsStatelessComponent2['default'])(path);
}

function resolveDefinition(definition, types) {
  if ((0, _utilsIsReactCreateClassCall2['default'])(definition)) {
    // return argument
    var resolvedPath = (0, _utilsResolveToValue2['default'])(definition.get('arguments', 0));
    if (types.ObjectExpression.check(resolvedPath.node)) {
      return resolvedPath;
    }
  } else if ((0, _utilsIsReactComponentClass2['default'])(definition)) {
    (0, _utilsNormalizeClassDefinition2['default'])(definition);
    return definition;
  } else if ((0, _utilsIsStatelessComponent2['default'])(definition)) {
    return definition;
  }
  return null;
}

/**
 * Given an AST, this function tries to find the exported component definition.
 *
 * The component definition is either the ObjectExpression passed to
 * `React.createClass` or a `class` definition extending `React.Component` or
 * having a `render()` method.
 *
 * If a definition is part of the following statements, it is considered to be
 * exported:
 *
 * modules.exports = Definition;
 * exports.foo = Definition;
 * export default Definition;
 * export var Definition = ...;
 */

function findExportedComponentDefinition(ast, recast) {
  var types = recast.types.namedTypes;
  var definition;

  function exportDeclaration(path) {
    var definitions = (0, _utilsResolveExportDeclaration2['default'])(path, types).filter(isComponentDefinition);

    if (definitions.length === 0) {
      return false;
    }
    if (definitions.length > 1 || definition) {
      // If a file exports multiple components, ... complain!
      throw new Error(ERROR_MULTIPLE_DEFINITIONS);
    }
    definition = resolveDefinition(definitions[0], types);
    return false;
  }

  recast.visit(ast, {
    visitFunctionDeclaration: ignore,
    visitFunctionExpression: ignore,
    visitClassDeclaration: ignore,
    visitClassExpression: ignore,
    visitIfStatement: ignore,
    visitWithStatement: ignore,
    visitSwitchStatement: ignore,
    visitCatchCause: ignore,
    visitWhileStatement: ignore,
    visitDoWhileStatement: ignore,
    visitForStatement: ignore,
    visitForInStatement: ignore,

    visitExportDeclaration: exportDeclaration,
    visitExportNamedDeclaration: exportDeclaration,
    visitExportDefaultDeclaration: exportDeclaration,

    visitAssignmentExpression: function visitAssignmentExpression(path) {
      // Ignore anything that is not `exports.X = ...;` or
      // `module.exports = ...;`
      if (!(0, _utilsIsExportsOrModuleAssignment2['default'])(path)) {
        return false;
      }
      // Resolve the value of the right hand side. It should resolve to a call
      // expression, something like React.createClass
      path = (0, _utilsResolveToValue2['default'])(path.get('right'));
      if (!isComponentDefinition(path)) {
        return false;
      }
      if (definition) {
        // If a file exports multiple components, ... complain!
        throw new Error(ERROR_MULTIPLE_DEFINITIONS);
      }
      definition = resolveDefinition(path, types);
      return false;
    }
  });

  return definition;
}

module.exports = exports['default'];