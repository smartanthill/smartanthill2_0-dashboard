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
    .controller('DeviceEditBusesController', DeviceEditBusesController);

  function DeviceEditBusesController($scope, $window, $modal, dataService) {

    var vm = this;
    vm.parent = $scope.vm;
    vm.device = vm.parent.device;
    vm.wizardMode = false;

    // handlers
    vm.busModal = busModal;
    vm.removeBus = removeBus;

    ////////////

    function busModal(index) {
      var state = {
        'enabled': true,
        'peripheral': {},
      };
      if (index === undefined || index === null) {
        index = -1;
      } else {
        angular.copy(vm.device.buses[index], state);
      }

      var modalInstance = $modal.open({
        templateUrl: 'views/device-bus.html',
        controller: 'DeviceBusController',
        controllerAs: 'vm',
        resolve: {
          initialState: function() {
            return state;
          },
          deviceInfo: function() {
            return vm.device;
          },
          editMode: function() {
            return index !== -1;
          },
          wizardMode: function() {
            return vm.wizardMode;
          },
          transportsList: ['dataService',
            function(dataService) {
              return dataService.transports().query().$promise;
            }
          ],
          serialPortsList: ['dataService',
            function(dataService) {
              return dataService.serialports.query().$promise;
            }
          ],
          boardInfo: ['dataService',
            function(dataService) {
              return dataService.boards.get({
                'boardId': vm.device.boardId
              }).$promise;
            }
          ],
        }
      });

      modalInstance.result.then(function(result) {
        if (index !== -1) {
          vm.device.buses[index] = result;
        } else {
          vm.device.buses.push(result);
        }
      });
    }

    function removeBus(index) {
      if (!$window.confirm('Delete this Bus?')) {
        return;
      }

      if (vm.device.buses.length && index > -1) {
        vm.device.buses.splice(index, 1);
      }
    }

  }

})();
