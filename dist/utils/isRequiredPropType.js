'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = isRequiredPropType;

var _utilsGetMembers = require('../utils/getMembers');

var _utilsGetMembers2 = _interopRequireDefault(_utilsGetMembers);

/**
 * Returns true of the prop is required, according to its type defintion
 */

function isRequiredPropType(path) {
  return (0, _utilsGetMembers2['default'])(path).some(function (member) {
    return !member.computed && member.path.node.name === 'isRequired' || member.computed && member.path.node.value === 'isRequired';
  });
}

module.exports = exports['default'];