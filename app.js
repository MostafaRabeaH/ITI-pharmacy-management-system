var app = angular.module('pharmaApp', ['ngRoute']);

app.run(function ($rootScope, $location) {

    var cashierRoutes = ['/pos', '/customers-list', '/customers-form', '/invoices-history' , '/dashboard' , '/medicines-list'];

    $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    $rootScope.logout = function () {
        localStorage.removeItem('currentUser');
        $rootScope.currentUser = null;
        window.history.replaceState(null, null, window.location.href);
        $location.path('/login');
    };

    $rootScope.$on('$routeChangeSuccess', function () {
        $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    });

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
            $location.path(currentUser.role === 'Admin' ? '/dashboard' : '/pos');
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
            controller: 'medicinesController'
        })
        .when('/medicine-form', {
            templateUrl: 'views/medicine-form.html',
            controller: 'medicinesController'
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
        
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'authController'
        })
        .when('/users-list', {
            templateUrl: 'views/users-list.html',
            controller: 'authController'
        })
        .when('/user-form', {
            templateUrl: 'views/user-form.html',
            controller: 'authController'
        })
        .otherwise({
            redirectTo: '/login'
        });
});