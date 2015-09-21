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
    .controller('DeviceEditBodyPartsController', DeviceEditBodyPartsController);

  function DeviceEditBodyPartsController($scope, $modal, idToNameMapper,
    dataService) {

    var vm = this;
    vm.parent = $scope.vm;
    vm.device = vm.parent.device;
    vm.plugins = dataService.plugins.query().$promise
      .then(function(pluginsList){
        vm.idToNameMap = idToNameMapper.mapIdToName(pluginsList);
        return pluginsList;
      });
    vm.wizardMode = false;

    // handlers
    vm.bodyPartModal = bodyPartModal;
    vm.removeBodyPart = removeBodyPart;

    ////////////

    function bodyPartModal(index) {
      var state = {
        'peripheral': {},
        'options': {},
      };
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
          pluginsList: function() {
            return vm.plugins;
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

  }

})();
