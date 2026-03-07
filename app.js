var app = angular.module('pharmaApp', ['ngRoute']);

app.run(function ($rootScope, $location, $window) {

    var cashierRoutes = ['/pos', '/customers-list', '/customers-form', '/invoices-history' , '/dashboard' , '/medicines-list'];

    $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    $rootScope.logout = function () {
        localStorage.removeItem('currentUser');
        $rootScope.currentUser = null;
        window.history.replaceState(null, null, window.location.href);
        $location.path('/login');
    };

    // Sidebar State and Toggle logic
    $rootScope.isSidebarOpen = false;
    $rootScope.windowWidth = $window.innerWidth;

    angular.element($window).bind('resize', function() {
        $rootScope.windowWidth = $window.innerWidth;
        if ($rootScope.windowWidth > 768) {
            $rootScope.isSidebarOpen = false; // reset when maximizing window
        }
        $rootScope.$applyAsync();
    });

    $rootScope.toggleSidebar = function() {
        $rootScope.isSidebarOpen = !$rootScope.isSidebarOpen;
    };

    $rootScope.$on('$routeChangeSuccess', function () {
        // From upstream: update current user state on route change
        $rootScope.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // From stash: close sidebar on navigation on mobile
        if ($rootScope.windowWidth <= 768 && $rootScope.isSidebarOpen) {
            $rootScope.isSidebarOpen = false;
        }
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
            controller: 'invoiceController'
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

