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

describe('getClassMemberValuePath', function () {
  var getClassMemberValuePath;
  var statement;

  beforeEach(function () {
    getClassMemberValuePath = require('../getClassMemberValuePath');

    var _require = require('../../../tests/utils');

    statement = _require.statement;
  });

  describe('MethodDefinitions', function () {
    it('finds "normal" method definitions', function () {
      var def = statement('\n        class Foo {\n          render() {}\n        }\n      ');

      expect(getClassMemberValuePath(def, 'render')).toBe(def.get('body', 'body', 0, 'value'));
    });

    it('finds computed method definitions with literal keys', function () {
      var def = statement('\n        class Foo {\n          [\'render\']() {}\n        }\n      ');

      expect(getClassMemberValuePath(def, 'render')).toBe(def.get('body', 'body', 0, 'value'));
    });

    it('ignores computed method definitions with expression', function () {
      var def = statement('\n        class Foo {\n          [render]() {}\n        }\n      ');

      expect(getClassMemberValuePath(def, 'render')).not.toBeDefined();
    });
  });

  describe('ClassProperty', function () {
    it('finds "normal" class properties', function () {
      var def = statement('\n        class Foo {\n          foo = 42;\n        }\n      ');

      expect(getClassMemberValuePath(def, 'foo')).toBe(def.get('body', 'body', 0, 'value'));
    });
  });
});