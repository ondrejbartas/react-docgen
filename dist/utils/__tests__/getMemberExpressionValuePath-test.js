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

describe('getMemberExpressionValuePath', function () {
  var getMemberExpressionValuePath;
  var statement;

  beforeEach(function () {
    getMemberExpressionValuePath = require('../getMemberExpressionValuePath');

    var _require = require('../../../tests/utils');

    statement = _require.statement;
  });

  describe('MethodExpression', function () {
    it('finds "normal" property definitions', function () {
      var def = statement('\n        var Foo = () => {};\n        Foo.propTypes = {};\n      ');

      expect(getMemberExpressionValuePath(def, 'propTypes')).toBe(def.parent.get('body', 1, 'expression', 'right'));
    });

    it('finds computed property definitions with literal keys', function () {
      var def = statement('\n        function Foo () {}\n        Foo[\'render\'] = () => {};\n      ');

      expect(getMemberExpressionValuePath(def, 'render')).toBe(def.parent.get('body', 1, 'expression', 'right'));
    });

    it('ignores computed property definitions with expression', function () {
      var def = statement('\n        var Foo = function Bar() {};\n        Foo[imComputed] = () => {};\n      ');

      expect(getMemberExpressionValuePath(def, 'imComputed')).not.toBeDefined();
    });
  });
});