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

  function DeviceBodyPartController($scope, $modalInstance, $window,
    extractNumberFromName, initialState, pluginsList, deviceInfo, boardInfo,
    editMode, wizardMode) {

    var vm = this;

    vm.device = deviceInfo;
    vm.plugins = pluginsList;
    vm.item = initialState;
    vm.boardPins = getBoardPins();
    vm.selectPlugin = {};
    vm.wizardMode = wizardMode;

    angular.forEach(vm.plugins, function(item) {
      if (item.id === initialState.pluginId) {
        vm.selectPlugin.selected = item;
      }
    });

    $scope.$watch('vm.selectPlugin.selected', function(newValue, oldValue) {
      if (!angular.isObject(newValue) || newValue === oldValue) {
        return;
      }

      vm.item.peripheral = {};
      vm.item.options = {};

      if (angular.isObject(vm.selectPlugin.selected.options)) {
        angular.forEach(vm.selectPlugin.selected.options, function(item) {
          if (!angular.isUndefined(item.default)) {
            vm.item.options[item.name] = item.default;
          }
        });
      }

      if (vm.wizardMode || !editMode || !vm.item.name) {
        vm.item.name = newValue.id;
        var existingNumber,
            bodyPartNumber = 1;
        angular.forEach(vm.device.bodyparts, function(bodypart) {
          if (bodypart.pluginId === newValue.id) {
            existingNumber = extractNumberFromName(bodypart.name);
            if (bodyPartNumber <= existingNumber) {
              bodyPartNumber = existingNumber + 1;
            }
          }
        });
        vm.item.name += '_' + bodyPartNumber;
      }

    });

    // handlers
    vm.save = save;
    vm.cancel = cancel;

    ////////////

    function getBoardPins() {
      var items = [],
        aliases;
      angular.forEach(boardInfo.pins, function(number) {
        aliases = [];
        angular.forEach(boardInfo.pinsAlias, function(value, key) {
          if (value === number) {
            aliases.push(key);
          }
        });

        items.push({
          'id': number,
          'name': (aliases.length ? number + ' (' + aliases.join(
            ', ') + ')' : number)
        });
      });
      return items;
    }

    function save() {
      if (!editMode) {
        for (var i = 0; i < vm.device.bodyparts.length; i++) {
          if (vm.item.name === vm.device.bodyparts[i].name) {
            $window.alert('BodyPart name must be unique within device.');
            return false;
          }
        }
      }
      $modalInstance.close({
        'name': vm.item.name,
        'pluginId': vm.selectPlugin.selected.id,
        'peripheral': vm.item.peripheral,
        'options': vm.item.options
      });
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  }

})();
