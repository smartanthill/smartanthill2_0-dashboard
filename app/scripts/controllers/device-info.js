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
    .controller('DeviceInfoController', DeviceInfoController);

  function DeviceInfoController($location, $modal, dataService, notifyUser,
    deviceInfo, pluginsList, idToNameMapper) {

    var vm = this;

    vm.device = deviceInfo;
    vm.board = dataService.boards.get({
      boardId: vm.device.boardId
    });
    vm.plugins = pluginsList;
    vm.idToNameMap = idToNameMapper.mapIdToName(vm.plugins);

    vm.deleteDevice = deleteDevice;
    vm.trainIt = trainIt;
    vm.runBodyPartModal = runBodyPartModal;

    ////////////

    function deleteDevice() {
      if (!window.confirm('Are sure you want to delete this device?')) {
        return false;
      }

      var devId = vm.device.id;
      vm.device.$delete()

      .then(function() {
        notifyUser(
          'success', 'Device #' + devId +
          ' has been successfully deleted!');

        $location.path('/devices');

      }, function(data) {
        notifyUser(
          'error', (
            'An unexpected error occurred when deleting device (' +
            data.data + ')')
        );
      });
    }

    function trainIt() {
      var modalInstance = $modal.open({
        templateUrl: 'views/device-trainit.html',
        controller: 'DeviceTrainItController',
        controllerAs: 'vm',
        backdrop: false,
        keyboard: false,
        resolve: {
          deviceInfo: function() {
            return vm.device;
          },
          serialPortsList: ['dataService',
            function(dataService) {
              return dataService.serialports.query().$promise;
            }
          ],
          settings: ['dataService',
            function(dataService) {
              return dataService.settings.get().$promise;
            }
          ]
        }
      });

      modalInstance.result.then(function(result) {
        notifyUser('success', result);
      }, function(failure) {
        if (failure) {
          notifyUser('error', failure);
        }
      });
    }

    function runBodyPartModal(bodyPart) {
      var modalInstance = $modal.open({
        templateUrl: 'views/device-bodypart-run.html',
        controller: 'RunDeviceBodyPartController',
        controllerAs: 'vm',
        resolve: {
          deviceInfo: function() {
            return vm.device;
          },
          bodyPartInfo: function() {
            return bodyPart;
          },
          pluginInfo: function() {
            var result;
            angular.forEach(pluginsList, function(plugin) {
              if (plugin.id === bodyPart.pluginId) {
                result = plugin;
              }
            });
            return result;
          },
          settings: ['dataService',
            function(dataService) {
              return dataService.settings.get().$promise;
            }
          ]
        }
      });
    }
  }

})();
