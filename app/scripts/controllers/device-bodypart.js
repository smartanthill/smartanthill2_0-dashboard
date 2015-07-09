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
    .controller('DeviceBodyPartController', DeviceBodyPartController);

  function DeviceBodyPartController($modalInstance, initialState, pluginsList,
    boardInfo) {

    var vm = this;

    vm.plugins = pluginsList;
    vm.item = initialState;
    vm.boardPins = getBoardPins();
    vm.selectPlugin = {};
    vm.test = true;

    angular.forEach(vm.plugins, function(item) {
      if (item.id === initialState.pluginId) {
        vm.selectPlugin.selected = item;
      }
    });

    // handlers
    vm.save = save;
    vm.cancel = cancel;

    ////////////

    function getBoardPins() {
      var options = [],
        aliases;
      console.log(boardInfo);
      angular.forEach(boardInfo.pins, function(number) {
        aliases = [];
        angular.forEach(boardInfo.pinsAlias, function(value, key) {
          if (value === number) {
            aliases.push(key);
          }
        });

        options.push({
          'id': number,
          'name': (aliases.length ? number + ' (' + aliases.join(
            ', ') + ')' : number)
        });
      });
      console.log(options);
      return options;
    }

    function save() {
      $modalInstance.close({
        'name': vm.item.name,
        'pluginId': vm.selectPlugin.selected.id,
        'peripheral': vm.item.peripheral
      });
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }

})();
