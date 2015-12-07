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

describe('findExportedComponentDefinition', function () {
  var findExportedComponentDefinition;
  var utils;
  var recast;

  function parse(source) {
    return findExportedComponentDefinition(utils.parse(source), recast);
  }

  beforeEach(function () {
    findExportedComponentDefinition = require('../findExportedComponentDefinition');
    utils = require('../../../tests/utils');
    recast = require('recast');
  });

  describe('CommonJS module exports', function () {

    describe('React.createClass', function () {

      it('finds React.createClass', function () {
        var source = '\n          var React = require("React");\n          var Component = React.createClass({});\n          module.exports = Component;\n        ';

        expect(parse(source)).toBeDefined();
      });

      it('finds React.createClass, independent of the var name', function () {
        var source = '\n          var R = require("React");\n          var Component = R.createClass({});\n          module.exports = Component;\n        ';

        expect(parse(source)).toBeDefined();
      });

      it('does not process X.createClass of other modules', function () {
        var source = '\n          var R = require("NoReact");\n          var Component = R.createClass({});\n          module.exports = Component;\n        ';

        expect(parse(source)).toBeUndefined();
      });
    });

    describe('class definitions', function () {

      it('finds class declarations', function () {
        var source = '\n          var React = require("React");\n          class Component extends React.Component {}\n          module.exports = Component;\n        ';

        var result = parse(source);
        expect(result).toBeDefined();
        expect(result.node.type).toBe('ClassDeclaration');
      });

      it('finds class expression', function () {
        var source = '\n          var React = require("React");\n          var Component = class extends React.Component {}\n          module.exports = Component;\n        ';

        var result = parse(source);
        expect(result).toBeDefined();
        expect(result.node.type).toBe('ClassExpression');
      });

      it('finds class definition, independent of the var name', function () {
        var source = '\n          var R = require("React");\n          class Component extends R.Component {}\n          module.exports = Component;\n        ';

        var result = parse(source);
        expect(result).toBeDefined();
        expect(result.node.type).toBe('ClassDeclaration');
      });
    });

    describe('stateless components', function () {

      it('finds stateless component with JSX', function () {
        var source = '\n          var React = require("React");\n          var Component = () => <div />;\n          module.exports = Component;\n        ';

        expect(parse(source)).toBeDefined();
      });

      it('finds stateless components with React.createElement, independent of the var name', function () {
        var source = '\n          var R = require("React");\n          var Component = () => R.createElement(\'div\', {});\n          module.exports = Component;\n        ';

        expect(parse(source)).toBeDefined();
      });

      it('does not process X.createElement of other modules', function () {
        var source = '\n          var R = require("NoReact");\n          var Component = () => R.createElement({});\n          module.exports = Component;\n        ';

        expect(parse(source)).toBeUndefined();
      });
    });

    describe('module.exports = <C>; / exports.foo = <C>;', function () {

      describe('React.createClass', function () {

        it('finds assignments to exports', function () {
          var source = '\n            var R = require("React");\n            var Component = R.createClass({});\n            exports.foo = 42;\n            exports.Component = Component;\n          ';

          expect(parse(source)).toBeDefined();
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            var R = require("React");\n            var ComponentA = R.createClass({});\n            var ComponentB = R.createClass({});\n            exports.ComponentA = ComponentA;\n            exports.ComponentB = ComponentB;\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            var R = require("React");\n            var ComponentA = R.createClass({});\n            var ComponentB = R.createClass({});\n            exports.ComponentB = ComponentB;\n          ';

          expect(parse(source)).toBeDefined();

          source = '\n            var R = require("React");\n            var ComponentA = R.createClass({});\n            var ComponentB = R.createClass({});\n            module.exports = ComponentB;\n          ';

          expect(parse(source)).toBeDefined();
        });
      });

      describe('class definition', function () {
        it('finds assignments to exports', function () {
          var source = '\n            var R = require("React");\n            class Component extends R.Component {}\n            exports.foo = 42;\n            exports.Component = Component;\n          ';

          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassDeclaration');
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            var R = require("React");\n            class ComponentA extends R.Component {}\n            class ComponentB extends R.Component {}\n            exports.ComponentA = ComponentA;\n            exports.ComponentB = ComponentB;\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            var R = require("React");\n            class ComponentA extends R.Component {}\n            class ComponentB extends R.Component {}\n            exports.ComponentB = ComponentB;\n          ';

          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassDeclaration');

          source = '\n            var R = require("React");\n            class ComponentA extends R.Component {}\n            class ComponentB extends R.Component {}\n            module.exports = ComponentB;\n          ';

          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassDeclaration');
        });
      });
    });
  });

  describe('ES6 export declarations', function () {

    describe('export default <component>;', function () {

      describe('React.createClass', function () {

        it('finds default export', function () {
          var source = '\n            var React = require("React");\n            var Component = React.createClass({});\n            export default Component\n          ';

          expect(parse(source)).toBeDefined();

          source = '\n            var React = require("React");\n            export default React.createClass({});\n          ';

          expect(parse(source)).toBeDefined();
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            import React, { createElement } from "React"\n            export var Component = React.createClass({})\n            export default React.createClass({});\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();

          source = '\n            import React, { createElement } from "React"\n            var Component = React.createClass({})\n            export {Component};\n            export default React.createClass({});\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            import React, { createElement } from "React"\n            var Component = React.createClass({})\n            export default React.createClass({});\n          ';

          expect(parse(source)).toBeDefined();
        });
      });

      describe('class definition', function () {

        it('finds default export', function () {
          var source = '\n            import React from \'React\';\n            class Component extends React.Component {}\n            export default Component;\n          ';

          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassDeclaration');

          source = '\n            import React from \'React\';\n            export default class Component extends React.Component {};\n          ';

          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassDeclaration');
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            import React from \'React\';\n            export var Component = class extends React.Component {};\n            export default class ComponentB extends React.Component{};\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();

          source = '\n            import React from \'React\';\n            var Component = class extends React.Component {};\n            export {Component};\n            export default class ComponentB extends React.Component{};\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            import React from \'React\';\n            var Component = class extends React.Component {};\n            export default class ComponentB extends React.Component{};\n          ';

          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassDeclaration');
        });
      });
    });

    describe('export var foo = <C>, ...;', function () {

      describe('React.createClass', function () {

        it('finds named exports', function () {
          var source = '\n            var React = require("React");\n            export var somethingElse = 42, Component = React.createClass({});\n          ';
          expect(parse(source)).toBeDefined();

          source = '\n            var React = require("React");\n            export let Component = React.createClass({}), somethingElse = 42;\n          ';
          expect(parse(source)).toBeDefined();

          source = '\n            var React = require("React");\n            export const something = 21,\n             Component = React.createClass({}),\n             somethingElse = 42;\n          ';
          expect(parse(source)).toBeDefined();

          source = '\n            var React = require("React");\n            export var somethingElse = function() {};\n            export let Component = React.createClass({});\n          ';
          expect(parse(source)).toBeDefined();
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            var R = require("React");\n            export var ComponentA = R.createClass({}),\n              ComponentB = R.createClass({});\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();

          source = '\n            var R = require("React");\n            export var ComponentA = R.createClass({}),\n            var ComponentB = R.createClass({});\n            export {ComponentB};\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            var R = require("React");\n            var ComponentA = R.createClass({});\n            export let ComponentB = R.createClass({});\n          ';

          expect(parse(source)).toBeDefined();
        });
      });

      describe('class definition', function () {

        it('finds named exports', function () {
          var source = '\n            import React from \'React\';\n            export var somethingElse = 42,\n              Component = class extends React.Component {};\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            export let Component = class extends React.Component {},\n              somethingElse = 42;\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            export const something = 21,\n              Component = class extends React.Component {},\n              somethingElse = 42;\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            export var somethingElse = function() {};\n            export let Component  = class extends React.Component {};\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            import React from \'React\';\n            export var ComponentA  = class extends React.Component {};\n            export var ComponentB  = class extends React.Component {};\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();

          source = '\n            import React from \'React\';\n            export var ComponentA = class extends React.Component {};\n            var ComponentB  = class extends React.Component {};\n            export {ComponentB};\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            import React from \'React\';\n            var ComponentA  = class extends React.Component {}\n            export var ComponentB = class extends React.Component {};\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');
        });
      });

      describe.only('stateless components', function () {

        it('finds named exports', function () {
          var source = '\n            import React from \'React\';\n            export var somethingElse = 42,\n              Component = () => <div />;\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ArrowFunctionExpression');

          source = '\n            import React from \'React\';\n            export let Component = () => <div />,\n              somethingElse = 42;\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ArrowFunctionExpression');

          source = '\n            import React from \'React\';\n            export const something = 21,\n              Component = () => <div />,\n              somethingElse = 42;\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ArrowFunctionExpression');

          source = '\n            import React from \'React\';\n            export var somethingElse = function() {};\n            export let Component = () => <div />\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ArrowFunctionExpression');
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            import React from \'React\';\n            export var ComponentA = () => <div />\n            export var ComponentB = () => <div />\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();

          source = '\n            import React from \'React\';\n            export var ComponentA = () => <div />\n            var ComponentB  = () => <div />\n            export {ComponentB};\n          ';
          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            import React from \'React\';\n            var ComponentA  = class extends React.Component {}\n            export var ComponentB = function() { return <div />; };\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('FunctionExpression');
        });
      });
    });

    describe('export {<C>};', function () {

      describe('React.createClass', function () {

        it('finds exported specifiers', function () {
          var source = '\n            var React = require("React");\n            var foo = 42;\n            var Component = React.createClass({});\n            export {foo, Component}\n          ';
          expect(parse(source)).toBeDefined();

          source = '\n            import React from "React"\n            var React = require("React");\n            var Component = React.createClass({});\n            export {Component, foo}\n          ';
          expect(parse(source)).toBeDefined();

          source = '\n            import React, { createElement } from "React"\n            var foo = 42;\n            var baz = 21;\n            var Component = React.createClass({});\n            export {foo, Component as bar, baz}\n          ';
          expect(parse(source)).toBeDefined();
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            var R = require("React");\n            var ComponentA = R.createClass({}),\n            var ComponentB = R.createClass({});\n            export {ComponentA as foo, ComponentB};\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            var R = require("React");\n            var ComponentA = R.createClass({});\n            var ComponentB = R.createClass({});\n            export {ComponentA}\n          ';

          expect(parse(source)).toBeDefined();
        });
      });

      describe('class definition', function () {

        it('finds exported specifiers', function () {
          var source = '\n            import React from \'React\';\n            var foo = 42;\n            var Component = class extends React.Component {};\n            export {foo, Component};\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            var foo = 42;\n            var Component = class extends React.Component {};\n            export {Component, foo};\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            var foo = 42;\n            var baz = 21;\n            var Component = class extends React.Component {};\n            export {foo, Component as bar, baz};\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            import React from \'React\';\n            var ComponentA = class extends React.Component {};\n            var ComponentB = class extends React.Component {};\n            export {ComponentA as foo, ComponentB};\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            import React from \'React\';\n            var ComponentA = class extends React.Component {};\n            var ComponentB = class extends React.Component {};\n            export {ComponentA};\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');
        });
      });

      describe('stateless components', function () {

        it('finds exported specifiers', function () {
          var source = '\n            import React from \'React\';\n            var foo = 42;\n            function Component = () { return <div />; }\n            export {foo, Component};\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            var foo = 42;\n            var Component = () => <div />;\n            export {Component, foo};\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');

          source = '\n            import React from \'React\';\n            var foo = 42;\n            var baz = 21;\n            var Component = function () { return <div />; }\n            export {foo, Component as bar, baz};\n          ';
          result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ClassExpression');
        });

        it('errors if multiple components are exported', function () {
          var source = '\n            import React from \'React\';\n            var ComponentA = () => <div />;\n            function ComponentB() { return <div />; }\n            export {ComponentA as foo, ComponentB};\n          ';

          expect(function () {
            return parse(source);
          }).toThrow();
        });

        it('accepts multiple definitions if only one is exported', function () {
          var source = '\n            import React from \'React\';\n            var ComponentA = () => <div />;\n            var ComponentB = () => <div />;\n            export {ComponentA};\n          ';
          var result = parse(source);
          expect(result).toBeDefined();
          expect(result.node.type).toBe('ArrowFunctionExpression');
        });
      });
    });

    // Only applies to classes
    describe('export <C>;', function () {

      it('finds named exports', function () {
        var source = '\n          import React from \'React\';\n          export var foo = 42;\n          export class Component extends React.Component {};\n        ';
        var result = parse(source);
        expect(result).toBeDefined();
        expect(result.node.type).toBe('ClassDeclaration');
      });

      it('errors if multiple components are exported', function () {
        var source = '\n          import React from \'React\';\n          export class ComponentA extends React.Component {};\n          export class ComponentB extends React.Component {};\n        ';

        expect(function () {
          return parse(source);
        }).toThrow();
      });

      it('accepts multiple definitions if only one is exported', function () {
        var source = '\n          import React from \'React\';\n          class ComponentA extends React.Component {};\n          export class ComponentB extends React.Component {};\n        ';
        var result = parse(source);
        expect(result).toBeDefined();
        expect(result.node.type).toBe('ClassDeclaration');
      });
    });
  });
});