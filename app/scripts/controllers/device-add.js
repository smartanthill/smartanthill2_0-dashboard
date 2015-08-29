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
    .controller('DeviceAddController', DeviceAddController);

  function DeviceAddController($scope, $state, dataService, notifyUser,
    extractNumberFromName, boardsList, devicesList, maxDeviceId) {

    var vm = this;

    vm.device = new dataService.devices();
    vm.device.bodyparts = [];
    vm.device.enabled = true;

    vm.boards = boardsList;
    vm.selectBoard = {};

    vm.steps = [
      {
        'name': 'devices.add.selectBoard',
        'title': 'Board',
        'completed': function() {return vm.selectBoard.selected;},
      },
      {
        'name': 'devices.add.selectTransport',
        'title': 'Transport',
        'completed': function() {
          return vm.device.connectionUri && vm.steps[0].completed();
        },
      },
      {
        'name': 'devices.add.selectBodyParts',
        'title': 'BodyParts',
        'completed': function() {
          return vm.device.bodyparts.length && vm.steps[1].completed();
        },
      },
      {
        'name': 'devices.add.finish',
        'title': 'Finish',
        'completed': function() {return false;},
      },
    ];

    if ($state.current.name !== vm.steps[0].name) {
      // Redirect to first step
      $state.go(vm.steps[0].name);
    }

    vm.submit = submit;

    vm.boardGroupBy = function(item) {
      return item.name.substr(0, item.name.indexOf('('));
    };

    $scope.$watch('vm.selectBoard.selected', function(newValue) {
      if (!angular.isObject(newValue)) {
        return;
      }
      vm.device.boardId = newValue.id;
    });

    ////////////

    function submit() {
      vm.disableSubmit = true;
      var i;

      var usedDeviceIds = [];
      var deviceNamesWithSameBoard = [];
      angular.forEach(devicesList, function(device){
        usedDeviceIds.push(device.id);
        if (device.boardId === vm.device.boardId) {
          deviceNamesWithSameBoard.push(device.name);
        }
      });

      // Assigning device id
      for (i = 1; i < maxDeviceId; i++) {
        if (usedDeviceIds.indexOf(i) === -1) {
          vm.device.id = i;
          break;
        }
      }
      if (angular.isUndefined(vm.device.id)) {
        notifyUser('error', 'Unable to add device. Max number of devices ' +
                            'exceeded.');
        return false;
      }

      // Assigning device name
      var existingNumber,
          deviceNumber = 1;
      for (i = 0; i < deviceNamesWithSameBoard.length; i++) {
        existingNumber = extractNumberFromName(deviceNamesWithSameBoard[i]);
        if (deviceNumber <= existingNumber) {
          deviceNumber = existingNumber + 1;
        }
      }
      vm.device.name = vm.device.boardId + '_' + deviceNumber;

      vm.device.$save()
        .then(function() {
          notifyUser('success', 'Settings have been successfully updated');
          $state.go('devices.info', {'deviceId': vm.device.id});
        }, function(data) {
          notifyUser('error', ('An unexpected error occurred when updating' +
            ' settings (' + data.data + ')'));
        })
        .finally(function() {
          vm.disableSubmit = false;
        });
    }
  }
})();
