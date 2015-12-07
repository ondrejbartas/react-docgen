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

describe('resolveToValue', function () {
  var builders;
  var utils;
  var resolveToValue;

  function parse(src) {
    var root = utils.parse(src);
    return root.get('body', root.node.body.length - 1, 'expression');
  }

  beforeEach(function () {
    var recast = require('recast');
    builders = recast.types.builders;
    resolveToValue = require('../resolveToValue');
    utils = require('../../../tests/utils');
  });

  it('resolves simple variable declarations', function () {
    var path = parse(['var foo  = 42;', 'foo;'].join('\n'));
    expect(resolveToValue(path).node).toEqualASTNode(builders.literal(42));
  });

  it('resolves object destructuring', function () {
    var path = parse(['var {foo: {bar: baz}} = bar;', 'baz;'].join('\n'));

    // Node should be equal to bar.foo.bar
    expect(resolveToValue(path).node).toEqualASTNode(builders.memberExpression(builders.memberExpression(builders.identifier('bar'), builders.identifier('foo')), builders.identifier('bar')));
  });

  it('handles SpreadProperties properly', function () {
    var path = parse(['var {foo: {bar}, ...baz} = bar;', 'baz;'].join('\n'));

    expect(resolveToValue(path).node).toEqualASTNode(path.node);
  });

  it('returns the original path if it cannot be resolved', function () {
    var path = parse(['function foo() {}', 'foo()'].join('\n'));

    expect(resolveToValue(path).node).toEqualASTNode(path.node);
  });

  it('resolves variable declarators to their init value', function () {
    var path = utils.parse('var foo = 42;').get('body', 0, 'declarations', 0);

    expect(resolveToValue(path).node).toEqualASTNode(builders.literal(42));
  });

  it('resolves to class declarations', function () {
    var program = utils.parse('\n      class Foo {}\n      Foo;\n    ');
    expect(resolveToValue(program.get('body', 1, 'expression')).node.type).toBe('ClassDeclaration');
  });

  it('resolves to class function declaration', function () {
    var program = utils.parse('\n      function foo() {}\n      foo;\n    ');
    expect(resolveToValue(program.get('body', 1, 'expression')).node.type).toBe('FunctionDeclaration');
  });

  describe('ImportDeclaration', function () {

    it('resolves default import references to the import declaration', function () {
      var path = parse(['import foo from "Foo"', 'foo;'].join('\n'));

      expect(resolveToValue(path).node.type).toBe('ImportDeclaration');
    });

    it('resolves named import references to the import declaration', function () {
      var path = parse(['import {foo} from "Foo"', 'foo;'].join('\n'));

      expect(resolveToValue(path).node.type).toBe('ImportDeclaration');
    });

    it('resolves aliased import references to the import declaration', function () {
      var path = parse(['import {foo as bar} from "Foo"', 'bar;'].join('\n'));

      expect(resolveToValue(path).node.type).toBe('ImportDeclaration');
    });
  });
});