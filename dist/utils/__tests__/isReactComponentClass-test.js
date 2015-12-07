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

describe('isReactComponentClass', function () {
  var isReactComponentClass;
  var expression, statement, parse;

  beforeEach(function () {
    isReactComponentClass = require('../isReactComponentClass');

    var _require = require('../../../tests/utils');

    expression = _require.expression;
    statement = _require.statement;
    parse = _require.parse;
  });

  describe('render method', function () {
    it('accepts class declarations with a render method', function () {
      var def = statement('class Foo { render() {}}');
      expect(isReactComponentClass(def)).toBe(true);
    });

    it('accepts class expression with a render method', function () {
      var def = expression('class { render() {}}');
      expect(isReactComponentClass(def)).toBe(true);
    });

    it('ignores static render methods', function () {
      var def = statement('class Foo { static render() {}}');
      expect(isReactComponentClass(def)).toBe(false);
    });

    it('ignores dynamic render methods', function () {
      var def = statement('class Foo { static [render]() {}}');
      expect(isReactComponentClass(def)).toBe(false);
    });

    it('ignores getter or setter render methods', function () {
      var def = statement('class Foo { get render() {}}');
      expect(isReactComponentClass(def)).toBe(false);

      def = statement('class Foo { set render(value) {}}');
      expect(isReactComponentClass(def)).toBe(false);
    });
  });

  describe('React.Component inheritance', function () {
    it('accepts class declarations extending React.Component', function () {
      var def = parse('\n        var React = require(\'react\');\n        class Foo extends React.Component {}\n      ').get('body', 1);

      expect(isReactComponentClass(def)).toBe(true);
    });

    it('accepts class expressions extending React.Component', function () {
      var def = parse('\n        var React = require(\'react\');\n        var Foo = class extends React.Component {}\n      ').get('body', 1, 'declarations', 0, 'init');

      expect(isReactComponentClass(def)).toBe(true);
    });

    it('resolves the super class reference', function () {
      var def = parse('\n        var {Component} = require(\'react\');\n        var C = Component;\n        class Foo extends C {}\n      ').get('body', 2);

      expect(isReactComponentClass(def)).toBe(true);
    });

    it('does not accept references to other modules', function () {
      var def = parse('\n        var {Component} = require(\'FakeReact\');\n        class Foo extends Component {}\n      ').get('body', 1);

      expect(isReactComponentClass(def)).toBe(false);
    });

    it('does not consider super class if render method is present', function () {
      var def = parse('\n        var {Component} = require(\'FakeReact\');\n        class Foo extends Component { render() {} }\n      ').get('body', 1);

      expect(isReactComponentClass(def)).toBe(true);
    });
  });
});