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
  var displayNameHandler;
  var expression, statement;

  beforeEach(function () {
    var _require = require('../../../tests/utils');

    expression = _require.expression;
    statement = _require.statement;

    documentation = new (require('../../Documentation'))();
    displayNameHandler = require('../displayNameHandler');
  });

  it('extracts the displayName', function () {
    var definition = expression('({displayName: "FooBar"})');
    displayNameHandler(documentation, definition);
    expect(documentation.displayName).toBe('FooBar');

    definition = statement('\n      class Foo {\n        static displayName = "BarFoo";\n      }\n    ');
    displayNameHandler(documentation, definition);
    expect(documentation.displayName).toBe('BarFoo');
  });

  it('resolves identifiers', function () {
    var definition = statement('\n      ({displayName: name})\n      var name = \'abc\';\n    ').get('expression');
    displayNameHandler(documentation, definition);
    expect(documentation.displayName).toBe('abc');

    definition = statement('\n      class Foo {\n        static displayName = name;\n      }\n      var name = \'xyz\';\n    ');
    displayNameHandler(documentation, definition);
    expect(documentation.displayName).toBe('xyz');
  });

  it('ignores non-literal names', function () {
    var definition = expression('({displayName: foo.bar})');
    expect(function () {
      return displayNameHandler(documentation, definition);
    }).not.toThrow();
    expect(documentation.displayName).not.toBeDefined();

    definition = statement('\n      class Foo {\n        static displayName = foo.bar;\n      }\n    ');
    expect(function () {
      return displayNameHandler(documentation, definition);
    }).not.toThrow();
    expect(documentation.displayName).not.toBeDefined();
  });

  it('ignores non-literal names', function () {
    var definition = expression('({displayName: foo.bar})');
    expect(function () {
      return displayNameHandler(documentation, definition);
    }).not.toThrow();
    expect(documentation.displayName).not.toBeDefined();

    definition = statement('\n      class Foo {\n        static displayName = foo.bar;\n      }\n    ');
    expect(function () {
      return displayNameHandler(documentation, definition);
    }).not.toThrow();
    expect(documentation.displayName).not.toBeDefined();
  });
});