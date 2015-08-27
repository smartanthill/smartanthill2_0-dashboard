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
    .config(routeConfig);

  function routeConfig($locationProvider, $stateProvider, $urlRouterProvider) {
    $locationProvider.hashPrefix('!');

    $urlRouterProvider.when('/devices', '/devices/list');
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('dashboard', {
        url: '/',
        templateUrl: '/views/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm',
      })

      .state('devices', {
        url: '/devices',
        template: '<ui-view/>',
      })

      .state('devices.list', {
        url: '/list',
        templateUrl: '/views/devices-list.html',
        controller: 'DevicesListController',
        controllerAs: 'vm',
        resolve: {
          devicesList: function(dataService) {
            return dataService.devices.query().$promise;
          },
        },
      })

      .state('devices.info', {
        url: '/:deviceId',
        templateUrl: '/views/device-info.html',
        controller: 'DeviceInfoController',
        controllerAs: 'vm',
        resolve: {
          deviceInfo: function($stateParams, dataService) {
            return dataService.devices.get({
              deviceId: $stateParams.deviceId
            }).$promise;
          },
          boardInfo: function(dataService, deviceInfo) {
            return dataService.boards.get({
              boardId: deviceInfo.boardId
            }).$promise;
          },
          pluginsList: function(dataService) {
            return dataService.plugins.query().$promise;
          }
        },
      })

      .state('devices.edit', {
        url: '/:deviceId/edit',
        templateUrl: '/views/device-edit.html',
        controller: 'DeviceEditController',
        controllerAs: 'vm',
        resolve: {
          deviceInfo: function($stateParams, dataService) {
            return dataService.devices.get({
              deviceId: $stateParams.deviceId
            }).$promise;
          },
          devicesList: function(dataService) {
            return dataService.devices.query().$promise;
          },
          boardsList: function(dataService) {
            return dataService.boards.query().$promise;
          },
        },
      })

      .state('network', {
        url: '/network',
        templateUrl: '/views/network.html',
        controller: 'NetworkController',
        controllerAs: 'vm',
      })

      .state('console', {
        url: '/console',
        templateUrl: '/views/console.html',
        controller: 'ConsoleController',
        controllerAs: 'vm',
      })

      .state('settings', {
        url: '/settings',
        templateUrl: 'views/settings.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        resolve: {
          settings: function(dataService) {
            return dataService.settings.get().$promise;
          },
        }
      })
      ;
  }
})();
