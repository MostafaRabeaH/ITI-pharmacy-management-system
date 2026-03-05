var app = angular.module('pharmaApp', ['ngRoute']);

app.run(function($rootScope, $location) {
    $rootScope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
    };
});

app.config(function ($routeProvider) {
    $routeProvider
            .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'dashboardController'
        })
        .when('/medicines-list', {
            templateUrl: 'views/medicines-list.html',
            controller: 'medicineController'
        })
        .when('/invoices-history', {
            templateUrl: 'views/invoices-history.html',
            controller: 'posController'
        })
        .when('/pos', {
            templateUrl: 'views/pos.html',
            controller: 'posController'
        })
        .when('/customers-list', {
            templateUrl: 'views/customers-list.html',
            controller: 'customerController'
        })
        .when('/customers-form', {
            templateUrl: 'views/customers-form.html',
            controller: 'customerController'
        })
        .when('/medicines-form', {
            templateUrl: 'views/medicines-form.html',
            controller: 'medicineController'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'authController'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
});