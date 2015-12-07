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

describe('defaultPropsHandler', function () {
  var documentation;
  var defaultPropsHandler;
  var parse;

  beforeEach(function () {
    var _require = require('../../../tests/utils');

    parse = _require.parse;

    documentation = new (require('../../Documentation'))();
    defaultPropsHandler = require('../defaultPropsHandler');
  });

  function test(definition) {
    defaultPropsHandler(documentation, definition);
    expect(documentation.descriptors).toEqual({
      foo: {
        defaultValue: {
          value: '"bar"',
          computed: false
        }
      },
      bar: {
        defaultValue: {
          value: '42',
          computed: false
        }
      },
      baz: {
        defaultValue: {
          value: '["foo", "bar"]',
          computed: false
        }
      },
      abc: {
        defaultValue: {
          value: '{xyz: abc.def, 123: 42}',
          computed: false
        }
      }
    });
  }

  describe('ObjectExpression', function () {
    it('should find prop default values that are literals', function () {
      var src = '\n        ({\n          getDefaultProps: function() {\n            return {\n              foo: "bar",\n              bar: 42,\n              baz: ["foo", "bar"],\n              abc: {xyz: abc.def, 123: 42}\n            };\n          }\n        })\n      ';
      test(parse(src).get('body', 0, 'expression'));
    });
  });

  describe('ClassDeclaration with static defaultProps', function () {
    it('should find prop default values that are literals', function () {
      var src = '\n        class Foo {\n          static defaultProps = {\n            foo: "bar",\n            bar: 42,\n            baz: ["foo", "bar"],\n            abc: {xyz: abc.def, 123: 42}\n          };\n        }\n      ';
      test(parse(src).get('body', 0));
    });
  });

  describe('ClassExpression with static defaultProps', function () {
    it('should find prop default values that are literals', function () {
      var src = '\n        var Bar = class {\n          static defaultProps = {\n            foo: "bar",\n            bar: 42,\n            baz: ["foo", "bar"],\n            abc: {xyz: abc.def, 123: 42}\n          };\n      }';
      test(parse(src).get('body', 0, 'declarations', 0, 'init'));
    });
  });

  it('should only consider Property nodes, not e.g. spread properties', function () {
    var src = '\n      ({\n        getDefaultProps: function() {\n          return {\n            ...Foo.bar,\n            bar: 42,\n          };\n        }\n      })\n    ';
    var definition = parse(src).get('body', 0, 'expression');
    expect(function () {
      return defaultPropsHandler(documentation, definition);
    }).not.toThrow();
    expect(documentation.descriptors).toEqual({
      bar: {
        defaultValue: {
          value: '42',
          computed: false
        }
      }
    });
  });
});