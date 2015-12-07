/*
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/*global jest, describe, it, expect*/

'use strict';

var _testsUtils = require('../../../tests/utils');

jest.dontMock('../getMemberExpressionRoot');

var getMemberExpressionRoot = require('../getMemberExpressionRoot');

describe('getMemberExpressionRoot', function () {
  it('returns the root of a member expression', function () {
    var root = getMemberExpressionRoot((0, _testsUtils.expression)('foo.bar.baz'));
    expect(root.node).toEqualASTNode((0, _testsUtils.expression)('foo').node);
  });
});