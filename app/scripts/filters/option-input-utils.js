/**
  Copyright (C) 2015 OLogN Technologies AG

  This source file is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License version 2
  as published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along
  with this program; if not, write to the Free Software Foundation, Inc.,
  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

(function() {
  'use strict';

  angular
    .module('siteApp')
    .filter('optionTypeToInputType', optionTypeToInputType)
    .filter('minNumberOptionValue', minNumberOptionValue)
    .filter('maxNumberOptionValue', maxNumberOptionValue)
    .filter('maxCharLength', maxCharLength);

  function optionTypeToInputType() {
    return function(type) {
      if (type.indexOf('int') !== -1) {
        return 'number';
      }
      return 'text';
    };
  }

  function minNumberOptionValue() {
    return function(option) {
      if (!angular.isUndefined(option.min) && option.min !== null) {
        return parseInt(option.min);
      }
      return _minOfType()(option.type);
    };
  }

  function maxNumberOptionValue() {
    return function(option) {
      if (!angular.isUndefined(option.max) && option.max !== null) {
        return parseInt(option.max);
      }
      return _maxOfType()(option.type);
    };
  }

  function maxCharLength() {
    return _extractSize;
  }

  function _extractSize(string) {
    return parseInt(/\[(\d+)\]/.exec(string)[1]);
  }

  function _isUnsigned(string) {
    return string.indexOf('u') === 0;
  }

  function _minOfType(type) {
    if (_isUnsigned(type)) {
      return 0;
    }
    var size = _extractSize(type) * 8;
    return -Math.pow(2, size - 1);
  }

  function _maxOfType(type) {
    var size = _extractSize(type) * 8;
    if (_isUnsigned(type)) {
      return Math.pow(2, size) - 1;
    }
    return Math.pow(2, size - 1) - 1;
  }

})();
