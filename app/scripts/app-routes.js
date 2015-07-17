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

  function routeConfig($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController',
        controllerAs: 'vm'
      })
      .when('/devices/add', {
        templateUrl: 'views/device-addoredit.html',
        controller: 'DeviceAddOrEditController',
        controllerAs: 'vm',
        resolve: {
          deviceInfo: function(dataService) {
            return null;
          },
          devicesList: ['dataService',
            function(dataService) {
              return dataService.devices.query().$promise;
            }
          ],
          boardsList: ['dataService',
            function(dataService) {
              return dataService.boards.query().$promise;
            }
          ],
          pluginsList: ['dataService',
            function(dataService) {
              return dataService.plugins.query().$promise;
            }
          ]
        }
      })
      .when('/devices/:deviceId/edit', {
        templateUrl: 'views/device-addoredit.html',
        controller: 'DeviceAddOrEditController',
        controllerAs: 'vm',
        resolve: {
          deviceInfo: ['$route', 'dataService',
            function($route, dataService) {
              return dataService.devices.get({
                deviceId: $route.current.params.deviceId
              }).$promise;
            }
          ],
          devicesList: ['dataService',
            function(dataService) {
              return dataService.devices.query().$promise;
            }
          ],
          boardsList: ['dataService',
            function(dataService) {
              return dataService.boards.query().$promise;
            }
          ],
          pluginsList: ['dataService',
            function(dataService) {
              return dataService.plugins.query().$promise;
            }
          ]
        }
      })
      .when('/devices/:deviceId', {
        templateUrl: 'views/device-info.html',
        controller: 'DeviceInfoController',
        controllerAs: 'vm',
        resolve: {
          deviceInfo: ['$route', 'dataService',
            function($route, dataService) {
              return dataService.devices.get({
                deviceId: $route.current.params.deviceId
              }).$promise;
            }
          ],
          pluginsList: ['dataService',
            function(dataService) {
              return dataService.plugins.query().$promise;
            }
          ]
        }
      })
      .when('/devices', {
        templateUrl: 'views/devices.html',
        controller: 'DevicesController',
        controllerAs: 'vm',
        resolve: {
          devicesList: ['dataService',
            function(dataService) {
              return dataService.devices.query().$promise;
            }
          ]
        }
      })
      .when('/network', {
        templateUrl: 'views/network.html',
        controller: 'NetworkController',
        controllerAs: 'vm'
      })
      .when('/console', {
        templateUrl: 'views/console.html',
        controller: 'ConsoleController',
        controllerAs: 'vm',
        resolve: {
          Messages: ['dataService',
            function(dataService) {
              return dataService.consoleMessages().$promise;
            }
          ]
        }
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        resolve: {
          Settings: ['dataService',
            function(dataService) {
              return dataService.settings.get().$promise;
            }
          ],
          LoggerLevels: function getValidLoggerLevels() {
            // TODO: get available levels via API
            return ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  }
})();
