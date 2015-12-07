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

describe('propTypeHandler', function () {
  var statement, expression;
  var getPropTypeMock;
  var documentation;
  var propTypeHandler;

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
    propTypeHandler = require('../propTypeHandler');
  });

  function template(src) {
    return '\n      ' + src + '\n      var React = require(\'React\');\n      var PropTypes = React.PropTypes;\n      var {PropTypes: OtherPropTypes} = React;\n    ';
  }

  function test(getSrc, parse) {
    it('passes the correct argument to getPropType', function () {
      var propTypesSrc = '\n        {\n          foo: PropTypes.bool,\n          abc: PropTypes.xyz,\n        }\n      ';
      var definition = parse(getSrc(propTypesSrc));
      var propTypesAST = expression(propTypesSrc);

      var fooPath = propTypesAST.get('properties', 0, 'value');
      var xyzPath = propTypesAST.get('properties', 1, 'value');

      propTypeHandler(documentation, definition);

      expect(getPropTypeMock.mock.calls[0][0].node).toEqualASTNode(fooPath.node);
      expect(getPropTypeMock.mock.calls[1][0].node).toEqualASTNode(xyzPath.node);
    });

    it('finds definitions via React.PropTypes', function () {
      var definition = parse(getSrc('\n        {\n          foo: PropTypes.bool,\n          bar: require("react").PropTypes.bool,\n          baz: OtherPropTypes.bool,\n        }\n      '));

      propTypeHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          type: {},
          required: false
        },
        bar: {
          type: {},
          required: false
        },
        baz: {
          type: {},
          required: false
        }
      });
    });

    it('finds definitions via the ReactPropTypes module', function () {
      var definition = parse(getSrc('\n        {\n          foo: require("ReactPropTypes").bool,\n        }\n      '));

      propTypeHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        foo: {
          type: {},
          required: false
        }
      });
    });

    it('detects whether a prop is required', function () {
      var definition = parse(getSrc('\n        {\n          simple_prop: PropTypes.array.isRequired,\n          complex_prop:\n            PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,\n        }\n      '));

      propTypeHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        simple_prop: { // eslint-disable-line camelcase
          type: {},
          required: true
        },
        complex_prop: { // eslint-disable-line camelcase
          type: {},
          required: true
        }
      });
    });

    it('only considers definitions from React or ReactPropTypes', function () {
      var definition = parse(getSrc('\n        {\n          custom_propA: PropTypes.bool,\n          custom_propB: Prop.bool.isRequired,\n        }\n      '));

      propTypeHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        custom_propA: { // eslint-disable-line camelcase
          type: {},
          required: false
        },
        custom_propB: { // eslint-disable-line camelcase
          type: {
            name: 'custom',
            raw: 'Prop.bool.isRequired'
          },
          required: false
        }
      });
    });

    it('resolves variables', function () {
      var definitionSrc = getSrc('props');
      var definition = parse('\n        ' + definitionSrc + '\n        var props = {bar: PropTypes.bool};\n      ');

      propTypeHandler(documentation, definition);
      expect(documentation.descriptors).toEqual({
        bar: {
          type: {},
          required: false
        }
      });
    });
  }

  describe('React.createClass', function () {
    test(function (propTypesSrc) {
      return template('({propTypes: ' + propTypesSrc + '})');
    }, function (src) {
      return statement(src).get('expression');
    });
  });

  describe('class definition', function () {
    test(function (propTypesSrc) {
      return template('\n        class Component {\n          static propTypes = ' + propTypesSrc + ';\n        }\n      ');
    }, function (src) {
      return statement(src);
    });
  });

  describe('stateless component', function () {
    test(function (propTypesSrc) {
      return template('\n        var Component = (props) => <div />;\n        Component.propTypes = ' + propTypesSrc + ';\n      ');
    }, function (src) {
      return statement(src);
    });
  });

  it('does not error if propTypes cannot be found', function () {
    var definition = expression('{fooBar: 42}');
    expect(function () {
      return propTypeHandler(documentation, definition);
    }).not.toThrow();

    definition = statement('class Foo {}');
    expect(function () {
      return propTypeHandler(documentation, definition);
    }).not.toThrow();
  });
});