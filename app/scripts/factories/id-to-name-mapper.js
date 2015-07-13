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
    .factory('idToNameMapper', idToNameMapper);

  function idToNameMapper() {
    return {
      mapIdToName: mapIdToName
    };

    function mapIdToName(plugins) {
      var result = {};
      var currentPrefix;
      angular.forEach(plugins, function(plugin) {
        result[plugin.id] = plugin.name;
        currentPrefix = plugin.id + '_';
        updateResultWithOptionsOrPeripheral(plugin.options, currentPrefix);
        updateResultWithOptionsOrPeripheral(plugin.peripheral, currentPrefix);
      });
      return result;

      function updateResultWithOptionsOrPeripheral(collection, prefix) {
        angular.forEach(collection, function(item) {
          result[prefix + item.name] = item.title;
        });
      }
    }
  }

})();
