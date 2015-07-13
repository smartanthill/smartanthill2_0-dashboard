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
    .controller('DeviceAddOrEditController', DeviceAddOrEditController);

  function DeviceAddOrEditController($scope, $location, $modal, dataService,
    notifyUser, deviceInfo, devicesList, boardsList, pluginsList,
    idToNameMapper) {
    var vm = this;

    vm.boards = boardsList;
    vm.selectBoard = {};
    vm.editMode = false;
    vm.prevState = {};
    vm.plugins = pluginsList;
    vm.idToNameMap = idToNameMapper.mapIdToName(vm.plugins);

    var usedDevIds = {};
    angular.forEach(devicesList, function(item) {
      usedDevIds[item.id] = true;
    });

    if (deviceInfo) {
      vm.device = deviceInfo;
      angular.forEach(vm.boards, function(item) {
        if (item.id === vm.device.boardId) {
          vm.selectBoard.selected = item;
        }
      });

      vm.editMode = true;
    } else {
      vm.device = new dataService.devices();
      vm.device.bodyparts = [];
    }

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
    vm.bodyPartModal = bodyPartModal;
    vm.removeBodyPart = removeBodyPart;
    vm.submitForm = submitForm;
    vm.resetForm = resetForm;

    ////////////

    function bodyPartModal(index) {
      var state = {};
      if (index === undefined || index === null) {
        index = -1;
      } else {
        angular.copy(vm.device.bodyparts[index], state);
      }

      var modalInstance = $modal.open({
        templateUrl: 'views/device-bodypart.html',
        controller: 'DeviceBodyPartController',
        controllerAs: 'vm',
        resolve: {
          initialState: function() {
            return state;
          },
          pluginsList: ['dataService',
            function(dataService) {
              return dataService.plugins.query().$promise;
            }
          ],
          boardInfo: ['dataService',
            function(dataService) {
              return dataService.boards.get({
                'boardId': vm.device.boardId
              }).$promise;
            }
          ]
        }
      });

      modalInstance.result.then(function(result) {
        if (index !== -1) {
          vm.device.bodyparts[index] = result;
        } else {
          vm.device.bodyparts.push(result);
        }
      });
    }

    function removeBodyPart(index) {
      if (!window.confirm('Delete this Body Part?')) {
        return;
      }

      if (vm.device.bodyparts.length && index > -1) {
        vm.device.bodyparts.splice(index, 1);
      }
    }

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
          notifyUser('success', 'Settings have been successfully ' + (
            vm.editMode ? 'updated' : 'added'));
          $location.path('/devices/' + vm.device.id);
        }, function(data) {
          notifyUser('error', ('An unexpected error occurred when ' + (
              vm.editMode ? 'updating' : 'adding') +
            ' settings (' +
            data.data + ')'));
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
