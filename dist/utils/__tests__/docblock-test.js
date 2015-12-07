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

jest.dontMock('../docblock');

describe('docblock', function () {

  describe('getDoclets', function () {
    var getDoclets = undefined;

    beforeEach(function () {
      var _require = require('../docblock');

      getDoclets = _require.getDoclets;
    });

    it('extracts single line doclets', function () {
      expect(getDoclets('@foo bar\n@bar baz')).toEqual({ foo: 'bar', bar: 'baz' });
    });

    it('extracts multi line doclets', function () {
      expect(getDoclets('@foo bar\nbaz\n@bar baz')).toEqual({ foo: 'bar\nbaz', bar: 'baz' });
    });

    it('extracts boolean doclets', function () {
      expect(getDoclets('@foo bar\nbaz\n@abc\n@bar baz')).toEqual({ foo: 'bar\nbaz', abc: true, bar: 'baz' });
    });
  });

  describe('getDocblock', function () {
    var comment = ['This is a docblock.', 'This is the second line.'];
    var source = ['/**', ' * ' + comment[0], ' * ' + comment[1], ' */', 'foo;'];

    var getDocblock = undefined;
    var statement = undefined;

    beforeEach(function () {
      var _require2 = require('../docblock');

      getDocblock = _require2.getDocblock;

      var _require3 = require('../../../tests/utils');

      statement = _require3.statement;
    });

    it('gets the closest docblock of the given node', function () {
      var node = statement(source.join('\n'));
      expect(getDocblock(node)).toEqual(comment.join('\n'));
    });

    var terminators = ['\n', '\r', '\u2028', '\u2029', '\r\n'];
    terminators.forEach(function (t) {
      it('can handle ' + escape(t) + ' as line terminator', function () {
        var node = statement(source.join(t));
        expect(getDocblock(node)).toEqual(comment.join('\n'));
      });
    });

    it('supports "short" docblocks', function () {
      var source = [// eslint-disable-line no-shadow
      '/** bar */', 'foo;'];
      var node = statement(source.join('\n'));
      expect(getDocblock(node)).toEqual('bar');
    });
  });
});