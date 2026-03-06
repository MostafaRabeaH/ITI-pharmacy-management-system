app.controller('authController', function($scope, $location, userService) {

    $scope.credentials = { username: '', password: '', role: 'Admin' };

    $scope.selectRole = function(role) {
        $scope.credentials.role = role;
    };

    $scope.login = function(form) {
        if (form.$invalid) return;

        $scope.errorMessage = '';
        $scope.loading = true;

        userService.loginUser($scope.credentials.username, $scope.credentials.password)
            .then(function(response) {
                var users = response.data;

                if (users.length === 0) {
                    $scope.errorMessage = 'Invalid username or password';
                    return;
                }

                var user = users[0];

                if (user.role !== $scope.credentials.role) {
                    $scope.errorMessage = 'Invalid role for this account';
                    return;
                }
                localStorage.setItem('currentUser', JSON.stringify(user));

                if (user.role === 'Admin') {
                    $location.path('/dashboard');
                } else if (user.role === 'Cashier') {
                    $location.path('/pos');
                }
            })
            .catch(function() {
                $scope.errorMessage = 'Something went wrong, please try again';
            })
            .finally(function() {
                $scope.loading = false;
            });
    };
});