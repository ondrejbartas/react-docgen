/*
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/*global jest, describe, it, expect, beforeEach*/

'use strict';

jest.autoMockOff();
jest.mock('../../Documentation');

describe('propTypeCompositionHandler', function () {
  var statement, expression;
  var getPropTypeMock;
  var documentation;
  var propTypeCompositionHandler;

  beforeEach(function () {
    var _require = require('../../../tests/utils');

    statement = _require.statement;
    expression = _require.expression;

    getPropTypeMock = jest.genMockFunction().mockImplementation(function () {
      return {};
    });
    jest.setMock('../../utils/getPropType', getPropTypeMock);
    jest.mock('../../utils/getPropType');

    documentation = new (require('../../Documentation'))();
    propTypeCompositionHandler = require('../propTypeCompositionHandler');
  });

  function test(getSrc, parse) {
    it('understands assignment from module', function () {
      var definition = parse('\n        ' + getSrc('Foo.propTypes') + '\n        var Foo = require("Foo.react");\n      ');

      propTypeCompositionHandler(documentation, definition);
      expect(documentation.composes).toEqual(['Foo.react']);

      documentation = new (require('../../Documentation'))();
      definition = parse('\n        ' + getSrc('SharedProps') + '\n        var SharedProps = require("SharedProps");\n      ');

      propTypeCompositionHandler(documentation, definition);
      expect(documentation.composes).toEqual(['SharedProps']);
    });

    it('understands the spread operator', function () {
      var definitionSrc = getSrc('\n        {\n          ...Foo.propTypes,\n          ...SharedProps,\n        }\n      ');
      var definition = parse('\n        ' + definitionSrc + '\n        var Foo = require("Foo.react");\n        var SharedProps = require("SharedProps");\n      ');

      propTypeCompositionHandler(documentation, definition);
      expect(documentation.composes).toEqual(['Foo.react', 'SharedProps']);
    });
  }

  describe('React.createClass', function () {
    test(function (propTypesSrc) {
      return '({propTypes: ' + propTypesSrc + '})';
    }, function (src) {
      return statement(src).get('expression');
    });
  });

  describe('class definition', function () {
    test(function (propTypesSrc) {
      return '\n        class Component {\n          static propTypes = ' + propTypesSrc + ';\n        }\n      ';
    }, function (src) {
      return statement(src);
    });
  });

  it('does not error if propTypes cannot be found', function () {
    var definition = expression('{fooBar: 42}');
    expect(function () {
      return propTypeCompositionHandler(documentation, definition);
    }).not.toThrow();

    definition = statement('class Foo {}');
    expect(function () {
      return propTypeCompositionHandler(documentation, definition);
    }).not.toThrow();
  });
});