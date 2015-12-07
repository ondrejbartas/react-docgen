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

describe('main', function () {
  var docgen, ERROR_MISSING_DEFINITION;

  beforeEach(function () {
    docgen = require('../main');

    var _require = require('../parse');

    ERROR_MISSING_DEFINITION = _require.ERROR_MISSING_DEFINITION;
  });

  function test(source) {
    it('parses with default resolver/handlers', function () {
      var docs = docgen.parse(source);
      expect(docs).toEqual({
        displayName: 'ABC',
        description: 'Example component description',
        props: {
          foo: {
            type: {
              name: 'bool'
            },
            defaultValue: {
              computed: false,
              value: 'true'
            },
            description: 'Example prop description',
            required: false
          }
        }
      });
    });

    it('parses with custom handlers', function () {
      var docs = docgen.parse(source, null, [docgen.handlers.componentDocblockHandler]);
      expect(docs).toEqual({
        description: 'Example component description'
      });
    });
  }

  describe('React.createClass', function () {
    test('\n      var React = require("React");\n      var PropTypes = React.PropTypes;\n      /**\n       * Example component description\n       */\n      var Component = React.createClass({\n        displayName: \'ABC\',\n        propTypes: {\n          /**\n           * Example prop description\n           */\n          foo: PropTypes.bool\n        },\n        getDefaultProps: function() {\n          return {\n            foo: true\n          };\n        }\n      });\n      module.exports = Component\n    ');
  });

  describe('Class definition', function () {
    test('\n      var React = require("React");\n      var PropTypes = React.PropTypes;\n      /**\n       * Example component description\n       */\n      export default class Component extends React.Component {\n        static propTypes = {\n          /**\n           * Example prop description\n           */\n          foo: PropTypes.bool\n        };\n        // ...\n      }\n      Component.defaultProps = {\n        foo: true,\n      };\n      Component.displayName = \'ABC\';\n    ');
  });

  describe('Stateless Component definition: ArrowFunctionExpression', function () {
    test('\n      import React, {PropTypes} from "React";\n\n      /**\n        * Example component description\n        */\n      let Component = props => <div />;\n      Component.displayName = \'ABC\';\n      Component.defaultProps = {\n          foo: true\n      };\n\n      Component.propTypes = {\n        /**\n        * Example prop description\n        */\n        foo: PropTypes.bool\n      };\n\n      export default Component;\n    ');
  });

  describe('Stateless Component definition: FunctionDeclaration', function () {
    test('\n      import React, {PropTypes} from "React";\n\n      /**\n      * Example component description\n      */\n      function Component (props) {\n        return <div />;\n      }\n\n      Component.displayName = \'ABC\';\n      Component.defaultProps = {\n          foo: true\n      };\n\n      Component.propTypes = {\n        /**\n        * Example prop description\n        */\n        foo: PropTypes.bool\n      };\n\n      export default Component;\n    ');
  });

  describe('Stateless Component definition: FunctionExpression', function () {
    test('\n      import React, {PropTypes} from "React";\n\n      /**\n      * Example component description\n      */\n      let Component = function(props) {\n        return React.createElement(\'div\', null);\n      }\n\n      Component.displayName = \'ABC\';\n      Component.defaultProps = {\n          foo: true\n      };\n\n      Component.propTypes = {\n        /**\n        * Example prop description\n        */\n        foo: PropTypes.bool\n      };\n\n      export default Component;\n    ');
  });

  describe('Stateless Component definition', function () {
    it('is not so greedy', function () {
      var source = '\n        import React, {PropTypes} from "React";\n\n        /**\n        * Example component description\n        */\n        let NotAComponent = function(props) {\n          let HiddenComponent = () => React.createElement(\'div\', null);\n\n          return 7;\n        }\n\n        NotAComponent.displayName = \'ABC\';\n        NotAComponent.defaultProps = {\n            foo: true\n        };\n\n        NotAComponent.propTypes = {\n          /**\n          * Example prop description\n          */\n          foo: PropTypes.bool\n        };\n\n        export default NotAComponent;\n      ';

      expect(function () {
        return docgen.parse(source);
      }).toThrow(ERROR_MISSING_DEFINITION);
    });
  });
});