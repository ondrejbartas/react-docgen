/*
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/*global jest, describe, beforeEach, it, expect*/

'use strict';

jest.autoMockOff();
jest.mock('../../Documentation');

describe('componentDocblockHandler', function () {
  var parse;
  var documentation;
  var componentDocblockHandler;

  function lastStatement(src) {
    var programPath = parse(src);
    return programPath.get('body', programPath.node.body.length - 1);
  }

  beforeEach(function () {
    var _require = require('../../../tests/utils');

    parse = _require.parse;

    documentation = new (require('../../Documentation'))();
    componentDocblockHandler = require('../componentDocblockHandler');
  });

  function test(definitionSrc, parse) {
    // eslint-disable-line no-shadow
    it('finds docblocks for component definitions', function () {
      var definition = parse('\n        import something from \'somewhere\';\n\n        /**\n         * Component description\n         */\n        ' + definitionSrc + '\n      ');

      componentDocblockHandler(documentation, definition);
      expect(documentation.description).toBe('Component description');
    });

    it('ignores other types of comments', function () {
      var definition = parse('\n        import something from \'somewhere\';\n\n        /*\n         * This is not a docblock\',\n         */\n        ' + definitionSrc + '\n      ');

      componentDocblockHandler(documentation, definition);
      expect(documentation.description).toBe('');

      definition = parse('\n        // Inline comment\'\n        ' + definitionSrc + '\n      ');

      componentDocblockHandler(documentation, definition);
      expect(documentation.description).toBe('');
    });

    it('only considers the docblock directly above the definition', function () {
      var definition = parse('\n        import something from \'somewhere\';\n\n        /**\n         * This is the wrong docblock\n         */\n        var something_else = "foo";\n        ' + definitionSrc + '\n      ');

      componentDocblockHandler(documentation, definition);
      expect(documentation.description).toBe('');
    });
  }

  /**
   * Decorates can only be assigned to class and therefore only make sense for
   * class declarations and export declarations.
   */
  function testDecorators(definitionSrc, parse) {
    // eslint-disable-line no-shadow
    describe('decorators', function () {
      it('uses the docblock above the decorator if it\'s the only one', function () {
        var definition = parse('\n          import something from \'somewhere\';\n          /**\n           * Component description\n           */\n          @Decorator1\n          @Decorator2\n          ' + definitionSrc + '\n        ');

        componentDocblockHandler(documentation, definition);
        expect(documentation.description).toBe('Component description');
      });

      it('uses the component docblock if present', function () {
        var definition = parse('\n          import something from \'somewhere\';\n          /**\n           * Decorator description\n           */\n          @Decorator1\n          @Decorator2\n          /**\n           * Component description\n           */\n          ' + definitionSrc + '\n        ');

        componentDocblockHandler(documentation, definition);
        expect(documentation.description).toBe('Component description');
      });
    });
  }

  describe('React.createClass', function () {
    test('var Component = React.createClass({})', function (src) {
      return lastStatement(src).get('declarations', 0, 'init', 'arguments', 0);
    });
  });

  describe('ClassDeclaration', function () {
    test('class Component {}', function (src) {
      return lastStatement(src);
    });
    testDecorators('class Component {}', function (src) {
      return lastStatement(src);
    });
  });

  describe('ClassExpression', function () {
    test('var Component = class {};', function (src) {
      return lastStatement(src).get('declarations', 0, 'init');
    });
  });

  describe('ES6 default exports', function () {

    describe('Default React.createClass export', function () {
      test('export default React.createClass({});', function (src) {
        return lastStatement(src).get('declaration', 'arguments', 0);
      });
    });

    describe('Default class declaration export', function () {
      test('export default class Component {}', function (src) {
        return lastStatement(src).get('declaration');
      });
      testDecorators('export default class Component {}', function (src) {
        return lastStatement(src).get('declaration');
      });
    });

    describe('Default class expression export', function () {
      test('export default class {}', function (src) {
        return lastStatement(src).get('declaration');
      });
      testDecorators('export default class {}', function (src) {
        return lastStatement(src).get('declaration');
      });
    });
  });

  describe('ES6 named exports', function () {

    describe('Named React.createClass export', function () {
      test('export var Component = React.createClass({});', function (src) {
        return lastStatement(src).get('declaration', 'declarations', '0', 'init', 'arguments', 0);
      });
    });

    describe('Named class declaration export', function () {
      test('export class Component {}', function (src) {
        return lastStatement(src).get('declaration');
      });
      testDecorators('export class Component {}', function (src) {
        return lastStatement(src).get('declaration');
      });
    });
  });
});