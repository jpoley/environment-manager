/* Copyright (c) Trainline Limited, 2016. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

angular.module('EnvironmentManager.common').factory('targetStateService', function($q, $http) {
  
 return {
   changeDeploymentStatus: function(enable, service, role, environment) {
     var deferred = $q.defer();
     var action = enable ? 'enable' : 'disable';
     var url = '/api/services/'+ action + '/' + service.Name;
     var data = {
       slice: service.Slice,
       environment: environment,
       serverRole: role
     };

     $http.post(url, data).then(function(result) {
       deferred.resolve(result.data)
     }, function(error) {
       deferred.reject(error.message);
     });

     return deferred.promise;
   }
 };
});
