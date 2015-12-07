/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/*global jest, describe, beforeEach, it, expect*/

'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

jest.dontMock('../normalizeClassDefinition').dontMock('../getMemberExpressionRoot').dontMock('../getMembers');

describe('normalizeClassDefinition', function () {
  var parse;
  var normalizeClassDefinition;

  beforeEach(function () {
    var _require = require('../../../tests/utils');

    parse = _require.parse;

    normalizeClassDefinition = require('../normalizeClassDefinition');
  });

  it('finds assignments to class declarations', function () {
    var classDefinition = parse('\n      class Foo {}\n      Foo.propTypes = 42;\n    ').get('body', 0);

    normalizeClassDefinition(classDefinition);

    var _classDefinition$node$body$body = _slicedToArray(classDefinition.node.body.body, 1);

    var classProperty = _classDefinition$node$body$body[0];

    expect(classProperty).toBeDefined();
    expect(classProperty.key.name).toBe('propTypes');
    expect(classProperty.value.value).toBe(42);
    expect(classProperty['static']).toBe(true);
  });

  it('finds assignments to class expressions', function () {
    var classDefinition = parse('\n      var Foo = class {};\n      Foo.propTypes = 42;\n    ').get('body', 0, 'declarations', 0, 'init');

    normalizeClassDefinition(classDefinition);
    var _classDefinition = classDefinition;

    var _classDefinition$node$body$body2 = _slicedToArray(_classDefinition.node.body.body, 1);

    var classProperty = _classDefinition$node$body$body2[0];

    expect(classProperty).toBeDefined();
    expect(classProperty.key.name).toBe('propTypes');
    expect(classProperty.value.value).toBe(42);
    expect(classProperty['static']).toBe(true);

    classDefinition = parse('\n      var Foo;\n      Foo = class {};\n      Foo.propTypes = 42;\n    ').get('body', 1, 'expression', 'right');

    normalizeClassDefinition(classDefinition);
    var _classDefinition2 = classDefinition;

    var _classDefinition2$node$body$body = _slicedToArray(_classDefinition2.node.body.body, 1);

    classProperty = _classDefinition2$node$body$body[0];

    expect(classProperty).toBeDefined();
  });

  it('ignores assignments further up the tree', function () {
    var classDefinition = parse('\n      var Foo = function() {\n        (class {});\n      };\n      Foo.bar = 42;\n    ').get('body', 0, 'declarations', 0, 'init', 'body', 'body', '0', 'expression');

    normalizeClassDefinition(classDefinition);

    var _classDefinition$node$body$body3 = _slicedToArray(classDefinition.node.body.body, 1);

    var classProperty = _classDefinition$node$body$body3[0];

    expect(classProperty).not.toBeDefined();
  });
});