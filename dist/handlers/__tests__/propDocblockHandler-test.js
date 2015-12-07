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

jest.autoMockOff();
jest.mock('../../Documentation');

describe('propDocBlockHandler', function () {
  var expression, statement;
  var documentation;
  var propDocBlockHandler;

  beforeEach(function () {
    var _require = require('../../../tests/utils');

    expression = _require.expression;
    statement = _require.statement;

    documentation = new (require('../../Documentation'))();
    propDocBlockHandler = require('../propDocBlockHandler');
  });

  function test(getSrc, parse) {
    it('finds docblocks for prop types', function () {
      var definition = parse(getSrc('\n        {\n          /**\n           * Foo comment\n           */\n          foo: Prop.bool,\n          /**\n           * Bar comment\n           */\n          bar: Prop.bool,\n        }\n     '));

      propDocBlockHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment'
        },
        bar: {
          description: 'Bar comment'
        }
      });
    });

    it('can handle multline comments', function () {
      var definition = parse(getSrc('\n        {\n          /**\n           * Foo comment with\n           * many lines!\n           *\n           * even with empty lines in between\n           */\n          foo: Prop.bool,\n        }\n      '));

      propDocBlockHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment with\nmany lines!\n\neven with empty lines in between'
        }
      });
    });

    it('ignores non-docblock comments', function () {
      var definition = parse(getSrc('\n        {\n          /**\n           * Foo comment\n           */\n          // TODO: remove this comment\n          foo: Prop.bool,\n          /**\n           * Bar comment\n           */\n          /* This is not a doc comment */\n          bar: Prop.bool,\n        }\n      '));

      propDocBlockHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment'
        },
        bar: {
          description: 'Bar comment'
        }
      });
    });

    it('only considers the comment with the property below it', function () {
      var definition = parse(getSrc('\n        {\n          /**\n           * Foo comment\n           */\n          foo: Prop.bool,\n          bar: Prop.bool,\n        }\n      '));

      propDocBlockHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment'
        },
        bar: {
          description: ''
        }
      });
    });

    it('understands and ignores the spread operator', function () {
      var definition = parse(getSrc('\n        {\n          ...Foo.propTypes,\n          /**\n           * Foo comment\n           */\n          foo: Prop.bool,\n        }\n      '));

      propDocBlockHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment'
        }
      });
    });

    it('resolves variables', function () {
      var definition = parse('\n        ' + getSrc('Props') + '\n        var Props = {\n          /**\n           * Foo comment\n           */\n          foo: Prop.bool,\n        };\n      ');

      propDocBlockHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          description: 'Foo comment'
        }
      });
    });
  }

  describe('React.createClass', function () {
    test(function (propTypesSrc) {
      return '({propTypes: ' + propTypesSrc + '})';
    }, function (src) {
      return statement(src).get('expression');
    });
  });

  describe('ClassDefinition', function () {
    test(function (propTypesSrc) {
      return '\n        class Foo{\n          static propTypes = ' + propTypesSrc + ';\n        }\n      ';
    }, function (src) {
      return statement(src);
    });
  });

  it('does not error if propTypes cannot be found', function () {
    var definition = expression('{fooBar: 42}');
    expect(function () {
      return propDocBlockHandler(documentation, definition);
    }).not.toThrow();

    definition = statement('class Foo {}');
    expect(function () {
      return propDocBlockHandler(documentation, definition);
    }).not.toThrow();
  });
});