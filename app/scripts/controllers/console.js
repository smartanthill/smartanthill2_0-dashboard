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

'use strict';

angular.module('siteApp')

.controller('ConsoleCtrl', function($scope, ngTableParams, siteStorage) {
  $scope.tableParams = new ngTableParams({ // jshint ignore:line
    count: -1,
    sorting: {
      id: 'asc'
    }
  }, {
    total: 0,
    counts: [],
    getData: function($defer, params) {
      siteStorage.devices.query(params.url(), function(data) {
        params.total(data.length);
        $defer.resolve(data);
      });
    }
  });
})
