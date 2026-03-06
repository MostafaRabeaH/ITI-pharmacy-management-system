var app = angular.module('pharmaApp', ['ngRoute']);

app.run(function ($rootScope, $location) {

    var cashierRoutes = ['/pos', '/customers-list', '/customers-form', '/invoices-history'];
    $rootScope.logout = function() {
        localStorage.removeItem('currentUser');
        window.history.replaceState(null, null, window.location.href);
        $location.path('/login');
    };
    $rootScope.$on('$routeChangeStart', function (event, next) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        var path = $location.path();

        if (!currentUser && path !== '/login') {
            event.preventDefault();
            $location.path('/login');
            return;
        }

        if (currentUser && path === '/login') {
            event.preventDefault();
            if (currentUser.role === 'Admin') {
                $location.path('/dashboard');
            } else {
                $location.path('/pos');
            }
            return;
        }

        if (currentUser && currentUser.role === 'Cashier') {
            if (!cashierRoutes.includes(path)) {
                event.preventDefault();
                $location.path('/pos');
            }
        }
    });

    $rootScope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $rootScope.isLoginPage = function () {
        return $location.path() === '/login';
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
            redirectTo: '/login'
        });
});