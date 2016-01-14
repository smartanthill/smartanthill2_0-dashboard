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

  function DeviceBodyPartController($scope, $uibModalInstance, $window,
    extractNumberFromName, getBoardPins, getOptionValue, initialState,
    pluginsList, deviceInfo, boardInfo, editMode, wizardMode) {

    var vm = this;

    vm.device = deviceInfo;
    vm.plugins = pluginsList;
    vm.item = initialState;
    vm.itemOptions = {};
    vm.boardPins = getBoardPins(boardInfo);
    vm.selectPlugin = {};
    vm.wizardMode = wizardMode;

    $scope.$watch('vm.selectPlugin.selected', function(newValue, oldValue) {
      if (!angular.isObject(newValue)) {
        return;
      }

      // Assigning default option values
      angular.forEach(vm.selectPlugin.selected.options, function(option) {
        vm.itemOptions[option.name] = getOptionValue(
          option, vm.item.options[option.name]);
      });

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

    angular.forEach(vm.plugins, function(item) {
      if (item.id === initialState.pluginId) {
        vm.selectPlugin.selected = item;
      }
    });

    // handlers
    vm.save = save;
    vm.cancel = cancel;

    ////////////

    function save() {
      if (!editMode) {
        for (var i = 0; i < vm.device.bodyparts.length; i++) {
          if (vm.item.name === vm.device.bodyparts[i].name) {
            $window.alert('BodyPart name must be unique within device.');
            return false;
          }
        }
      }

      // Copy option values to item object
      angular.forEach(vm.selectPlugin.selected.options, function(spec) {
        vm.item.options[spec.name] = spec._values ?
          vm.itemOptions[spec.name].value : vm.itemOptions[spec.name];
      });

      $uibModalInstance.close({
        'name': vm.item.name,
        'pluginId': vm.selectPlugin.selected.id,
        'peripheral': vm.item.peripheral,
        'options': vm.item.options
      });
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();
