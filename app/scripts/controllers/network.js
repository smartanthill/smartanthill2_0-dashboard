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
    .controller('NetworkController', NetworkController);

  function NetworkController($window, $modal, $state, notifyUser, hubsList) {
    var vm = this;
    vm.hubs = hubsList;
    vm.hubsBackup = angular.copy(hubsList);
    vm.disableSubmit = false;

    // handlers
    vm.hubModal = hubModal;
    vm.removeHub = removeHub;
    vm.submit = submit;
    vm.reset = reset;

    ////////////

    function hubModal(index) {
      var state = {
        'enabled': true,
      };
      if (index === undefined || index === null) {
        index = -1;
      } else {
        angular.copy(vm.hubs.items[index], state);
      }

      var modalInstance = $modal.open({
        templateUrl: 'views/network-hub.html',
        controller: 'NetworkHubController',
        controllerAs: 'vm',
        resolve: {
          initialState: function() {
            return state;
          },
          editMode: function() {
            return index !== -1;
          },
          serialPortsList: ['dataService',
            function(dataService) {
              return dataService.serialports.query().$promise;
            }
          ],
          transportsList: ['dataService',
            function(dataService) {
              return dataService.transports().query().$promise;
            }
          ],
        }
      });

      modalInstance.result.then(function(result) {
        if (index !== -1) {
          vm.hubs.items[index] = result;
        } else {
          vm.hubs.items.push(result);
        }
      });
    }

    function removeHub(index) {
      if (!$window.confirm('Delete this Hub?')) {
        return;
      }

      if (vm.hubs.items.length && index > -1) {
        vm.hubs.items.splice(index, 1);
      }
    }

    function submit() {
      vm.disableSubmit = true;

      vm.hubs.$save()
        .then(function() {
          notifyUser('success', 'Hubs list have been successfully updated');
          $state.go($state.current.name);
        }, function(data) {
          notifyUser('error', ('An unexpected error occurred when updating' +
            ' hubs list (' + data.data + ')'));
        })
        .finally(function() {
          vm.disableSubmit = false;
        });
    }

    function reset() {
      vm.hubs = angular.copy(vm.hubsBackup);
    }

  }

})();
