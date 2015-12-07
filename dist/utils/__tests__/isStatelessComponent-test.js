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

describe('isStatelessComponent', function () {
  var isStatelessComponent;
  var statement, parse;

  beforeEach(function () {
    isStatelessComponent = require('../isStatelessComponent');

    var _require = require('../../../tests/utils');

    statement = _require.statement;
    parse = _require.parse;
  });

  describe('Stateless Function Components with JSX', function () {
    it('accepts simple arrow function components', function () {
      var def = parse('var Foo = () => <div />').get('body', 0).get('declarations', [0]).get('init');
      expect(isStatelessComponent(def)).toBe(true);
    });

    it('accepts simple function expressions components', function () {
      var def = parse('let Foo = function() { return <div />; };').get('body', 0).get('declarations', [0]).get('init');
      expect(isStatelessComponent(def)).toBe(true);
    });

    it('accepts simple function declaration components', function () {
      var def = parse('function Foo () { return <div /> }').get('body', 0);
      expect(isStatelessComponent(def)).toBe(true);
    });
  });

  describe('Stateless Function Components with React.createElement', function () {
    it('accepts simple arrow function components', function () {
      var def = parse('\n        var AlphaBetters = require(\'react\');\n        var Foo = () => AlphaBetters.createElement("div", null);\n      ').get('body', 1).get('declarations', [0]).get('init');

      expect(isStatelessComponent(def)).toBe(true);
    });

    it('accepts simple function expressions components', function () {
      var def = parse('\n        var React = require(\'react\');\n        let Foo = function() { return React.createElement("div", null); };\n      ').get('body', 1).get('declarations', [0]).get('init');

      expect(isStatelessComponent(def)).toBe(true);
    });

    it('accepts simple function declaration components', function () {
      var def = parse('\n        var React = require(\'react\');\n        function Foo () { return React.createElement("div", null); }\n      ').get('body', 1);
      expect(isStatelessComponent(def)).toBe(true);
    });
  });

  describe('Stateless Function Components inside module pattern', function () {
    it('', function () {
      var def = parse('\n        var React = require(\'react\');\n        var Foo = {\n          Bar() { return <div />; },\n          Baz: function() { return React.createElement(\'div\'); },\n          [\'hello\']: function() { return React.createElement(\'div\'); },\n          render() { return 7; }\n        }\n      ').get('body', 1).get('declarations', 0).get('init');

      var bar = def.get('properties', 0);
      var baz = def.get('properties', 1);
      var hello = def.get('properties', 2);
      var render = def.get('properties', 3);

      expect(isStatelessComponent(bar)).toBe(true);
      expect(isStatelessComponent(baz)).toBe(true);
      expect(isStatelessComponent(hello)).toBe(true);
      expect(isStatelessComponent(render)).toBe(false);
    });
  });

  describe('is not overzealous', function () {
    it('does not accept declarations with a render method', function () {
      var def = statement('\n        class Foo {\n          render() {\n            return <div />;\n          }\n        }\n      ');
      expect(isStatelessComponent(def)).toBe(false);
    });

    it('does not accept React.Component classes', function () {
      var def = parse('\n        var React = require(\'react\');\n        class Foo extends React.Component {\n          render() {\n            return <div />;\n          }\n        }\n      ').get('body', 1);

      expect(isStatelessComponent(def)).toBe(false);
    });

    it('does not accept React.createClass calls', function () {
      var def = statement('\n        React.createClass({\n          render() {\n            return <div />;\n          }\n        });\n      ');

      expect(isStatelessComponent(def)).toBe(false);
    });

    it('does not mark containing functions as StatelessComponents', function () {
      var def = parse('\n        var React = require(\'react\');\n        function Foo (props) {\n          function Bar() {\n            return React.createElement("div", props);\n          }\n\n          return {Bar}\n        }\n      ').get('body', 1);

      expect(isStatelessComponent(def)).toBe(false);
    });
  });

  describe('resolving return values', function () {
    function test(desc, code) {
      it(desc, function () {
        var def = parse(code).get('body', 1);

        expect(isStatelessComponent(def)).toBe(true);
      });
    }

    test('handles simple resolves', '\n      var React = require(\'react\');\n      function Foo (props) {\n        function bar() {\n          return React.createElement("div", props);\n        }\n\n        return bar();\n      }\n    ');

    test('handles reference resolves', '\n      var React = require(\'react\');\n      function Foo (props) {\n        var result = bar();\n\n        return result;\n\n        function bar() {\n          return <div />;\n        }\n      }\n    ');

    test('handles shallow member call expression resolves', '\n      var React = require(\'react\');\n      function Foo (props) {\n        var shallow = {\n          shallowMember() {\n            return <div />;\n          }\n        };\n\n        return shallow.shallowMember();\n      }\n    ');

    test('handles deep member call expression resolves', '\n      var React = require(\'react\');\n      function Foo (props) {\n        var obj = {\n          deep: {\n            member() {\n              return <div />;\n            }\n          }\n        };\n\n        return obj.deep.member();\n      }\n    ');

    test('handles external reference member call expression resolves', '\n      var React = require(\'react\');\n      function Foo (props) {\n        var member = () => <div />;\n        var obj = {\n          deep: {\n            member: member\n          }\n        };\n\n        return obj.deep.member();\n      }\n    ');

    test('handles external reference member call expression resolves', '\n      var React = require(\'react\');\n      function Foo (props) {\n        var member = () => <div />;\n        var obj = {\n          deep: {\n            member: member\n          }\n        };\n\n        return obj.deep.member();\n      }\n    ');

    test('handles all sorts of JavaScript things', '\n      var React = require(\'react\');\n      function Foo (props) {\n        var external = {\n          member: () => <div />\n        };\n        var obj = {external};\n\n        return obj.external.member();\n      }\n    ');
  });
});