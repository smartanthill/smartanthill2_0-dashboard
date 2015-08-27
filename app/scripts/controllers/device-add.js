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
    boardsList, devicesList, maxDeviceId) {

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
        'disabled': function() {return false;},
      },
      {
        'name': 'devices.add.selectTransport',
        'title': 'Transport',
        'disabled': function() {
          return !vm.selectBoard.selected;
        },
      },
      {
        'name': 'devices.add.selectBodyParts',
        'title': 'BodyParts',
        'disabled': function() {
          return !vm.selectBoard.selected;
        },
      },
    ];

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

      var usedDeviceIds = [];
      angular.forEach(devicesList, function(device){
        usedDeviceIds.push(device.id);
      });
      for (var i = 1; i < maxDeviceId; i++) {
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
