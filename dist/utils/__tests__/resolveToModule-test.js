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

describe('resolveToModule', function () {
  var utils;
  var resolveToModule;

  function parse(src) {
    var root = utils.parse(src);
    return root.get('body', root.node.body.length - 1, 'expression');
  }

  beforeEach(function () {
    resolveToModule = require('../resolveToModule');
    utils = require('../../../tests/utils');
  });

  it('resolves identifiers', function () {
    var path = parse('\n      var foo = require("Foo");\n      foo;\n    ');
    expect(resolveToModule(path)).toBe('Foo');
  });

  it('resolves function calls', function () {
    var path = parse('\n      var foo = require("Foo");\n      foo();\n    ');
    expect(resolveToModule(path)).toBe('Foo');
  });

  it('resolves member expressions', function () {
    var path = parse('\n      var foo = require("Foo");\n      foo.bar().baz;\n    ');
    expect(resolveToModule(path)).toBe('Foo');
  });

  it('understands destructuring', function () {
    var path = parse('\n      var {foo} = require("Foo");\n      foo;\n    ');
    expect(resolveToModule(path)).toBe('Foo');
  });

  describe('ES6 import declarations', function () {

    it('resolves ImportDefaultSpecifier', function () {
      var path = parse('\n        import foo from "Foo";\n        foo;\n      ');
      expect(resolveToModule(path)).toBe('Foo');

      path = parse('\n        import foo, {createElement} from "Foo";\n        foo;\n      ');
      expect(resolveToModule(path)).toBe('Foo');
    });

    it('resolves ImportSpecifier', function () {
      var path = parse('\n        import {foo, bar} from "Foo";\n        bar;\n      ');
      expect(resolveToModule(path)).toBe('Foo');
    });

    it('resolves aliased ImportSpecifier', function () {
      var path = parse('\n        import {foo, bar as baz} from "Foo";\n        baz;\n      ');
      expect(resolveToModule(path)).toBe('Foo');
    });
  });
});