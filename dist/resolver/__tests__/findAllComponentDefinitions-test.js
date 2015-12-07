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

describe('findAllComponentDefinitions', function () {
  var findAllComponentDefinitions;
  var recast;
  var utils;

  function parse(source) {
    return findAllComponentDefinitions(utils.parse(source), recast);
  }

  beforeEach(function () {
    findAllComponentDefinitions = require('../findAllComponentDefinitions');
    utils = require('../../../tests/utils');
    recast = require('recast');
  });

  describe('React.createClass', function () {

    it('finds React.createClass', function () {
      var source = '\n        var React = require("React");\n        var Component = React.createClass({});\n        module.exports = Component;\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0] instanceof recast.types.NodePath).toBe(true);
      expect(result[0].node.type).toBe('ObjectExpression');
    });

    it('finds React.createClass, independent of the var name', function () {
      var source = '\n        var R = require("React");\n        var Component = R.createClass({});\n        module.exports = Component;\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('does not process X.createClass of other modules', function () {
      var source = '\n        var R = require("NoReact");\n        var Component = R.createClass({});\n        module.exports = Component;\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('finds assignments to exports', function () {
      var source = '\n        var R = require("React");\n        var Component = R.createClass({});\n        exports.foo = 42;\n        exports.Component = Component;\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('accepts multiple definitions', function () {
      var source = '\n        var R = require("React");\n        var ComponentA = R.createClass({});\n        var ComponentB = R.createClass({});\n        exports.ComponentB = ComponentB;\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      source = '\n        var R = require("React");\n        var ComponentA = R.createClass({});\n        var ComponentB = R.createClass({});\n        module.exports = ComponentB;\n      ';

      result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('class definitions', function () {

    it('finds component classes', function () {
      var source = '\n        import React from \'React\';\n        class ComponentA extends React.Component {}\n        class ComponentB { render() {} }\n        var ComponentC = class extends React.Component {}\n        var ComponentD = class { render() {} }\n        class NotAComponent {}\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(4);
    });

    it('finds React.createClass, independent of the var name', function () {
      var source = '\n        import R from \'React\';\n        class Component extends R.Component {};\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('does not process X.createClass of other modules', function () {
      var source = '\n        import R from \'FakeReact\';\n        class Component extends R.Component {};\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('stateless components', function () {

    it('finds stateless components', function () {
      var source = '\n        import React from \'React\';\n        let ComponentA = () => <div />;\n        function ComponentB () { return React.createElement(\'div\', null); }\n        const ComponentC = function(props) { return <div>{props.children}</div>; };\n        var Obj = {\n          component() { if (true) { return <div />; } }\n        };\n        const ComponentD = function(props) {\n          var result = <div>{props.children}</div>;\n          return result;\n        };\n        const ComponentE = function(props) {\n          var result = () => <div>{props.children}</div>;\n          return result();\n        };\n        const ComponentF = function(props) {\n          var helpers = {\n            comp() { return <div>{props.children}</div>; }\n          };\n          return helpers.comp();\n        };\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('finds React.createElement, independent of the var name', function () {
      var source = '\n        import AlphaBetters from \'react\';\n        function ComponentA () { return AlphaBetters.createElement(\'div\', null); }\n        function ComponentB () { return 7; }\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('does not process X.createClass of other modules', function () {
      var source = '\n        import R from \'FakeReact\';\n        const ComponentA = () => R.createElement(\'div\', null);\n      ';

      var result = parse(source);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});