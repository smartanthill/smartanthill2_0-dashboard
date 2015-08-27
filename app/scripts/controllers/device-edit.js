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

  angular.module('siteApp')
    .controller('DeviceEditController', DeviceEditController);

  function DeviceEditController($scope, $location, $modal, dataService,
    notifyUser, deviceInfo, devicesList, boardsList) {
    var vm = this;

    vm.boards = boardsList;
    vm.selectBoard = {};
    vm.prevState = {};

    var usedDevIds = {};
    angular.forEach(devicesList, function(item) {
      usedDevIds[item.id] = true;
    });

    vm.device = deviceInfo;
    angular.forEach(vm.boards, function(item) {
      if (item.id === vm.device.boardId) {
        vm.selectBoard.selected = item;
      }
    });

    vm.prevState = angular.copy(vm.device);

    $scope.$watch('vm.selectBoard.selected', function(newValue) {
      if (!angular.isObject(newValue)) {
        return;
      }
      vm.device.boardId = newValue.id;
    });

    vm.boardGroupBy = function(item) {
      return item.name.substr(0, item.name.indexOf('('));
    };

    // handlers
    vm.submitForm = submitForm;
    vm.resetForm = resetForm;

    ////////////

    function submitForm() {
      vm.submitted = true;

      if (vm.device.id !== vm.prevState.id &&
        usedDevIds[vm.device.id]) {
        window.alert('This Device ID is already used by another device.');
        return;
      }

      vm.disableSubmit = true;

      vm.device.$save()
        .then(function() {
          notifyUser('success', 'Settings have been successfully updated');
          $location.path('/devices/' + vm.device.id);
        }, function(data) {
          notifyUser('error', ('An unexpected error occurred when updating' +
            ' settings (' + data.data + ')'));
        })
        .finally(function() {
          vm.disableSubmit = false;
        });
    }

    function resetForm() {
      angular.copy(vm.prevState, vm.device);
      $scope.$broadcast('form-reset');
      vm.submitted = false;
    }
  }

})();
