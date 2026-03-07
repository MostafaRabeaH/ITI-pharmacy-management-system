app.controller('authController', function ($scope, $location, userService) {
    $scope.users = [];
    $scope.loading = false;
    $scope.newUserData = {};
    $scope.isEdit = false;
    $scope.formSubmitted = false;
    $scope.usernameExists = false;
    $scope.credentials = { username: '', password: '', role: 'Admin' };
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.showModal = false;
    $scope.selectedUser = {};
    var editData = localStorage.getItem('editUser');
    
    $scope.loadUsers = function () {
        $scope.loading = true;
        userService.getAllUsers().then(function (response) {
            $scope.users = response.data;
            $scope.loading = false;
        });
    };

    $scope.checkUsername = function () {
        if (!$scope.newUserData.username) return;
        userService.getAllUsers().then(function (response) {
            $scope.usernameExists = response.data.some(function (u) {
                if ($scope.isEdit && u.id === $scope.newUserData.id) return false;
                return u.username.toLowerCase() === $scope.newUserData.username.toLowerCase();
            });
        });
    };

    $scope.submitForm = function (form) {
        $scope.formSubmitted = true;
        angular.forEach(form, function (field) {
            if (typeof field === 'object' && field.hasOwnProperty('$modelValue')) {
                field.$setTouched();
            }
        });
        if (form.$invalid || $scope.usernameExists) return;
        if ($scope.isEdit) {
            $scope.updateUser();
        } else {
            $scope.addUser();
        }
    };
    
    if (editData) {
        $scope.isEdit = true;
        $scope.newUserData = JSON.parse(editData);
        localStorage.removeItem('editUser');
    }

    $scope.editUser = function (user) {
        localStorage.setItem('editUser', JSON.stringify(user));
        $location.path('/user-form');
    };

    $scope.addUser = function () {
        userService.insertUser($scope.newUserData).then(function () {
            $scope.newUserData = {};
            $location.path('/users-list');
        });
    };

    $scope.updateUser = function () {
        var dataToSend = angular.copy($scope.newUserData);
        userService.updateUser(dataToSend.id, dataToSend).then(function () {
            localStorage.removeItem('editUser');
            $location.path('/users-list');
        });
    };

    $scope.deleteUser = function (userId) {
        if (!confirm('Delete this user?')) return;
        userService.deleteUser(userId).then(function () {
            $scope.loadUsers();
        });
    };

    $scope.cancelEdit = function () {
        $scope.isEdit = false;
        $scope.newUserData = {};
        localStorage.removeItem('editUser');
        $location.path('/users-list');
    };

    $scope.login = function (form) {
        if (form.$invalid) return;

        $scope.errorMessage = '';
        $scope.loading = true;

        userService.loginUser($scope.credentials.username, $scope.credentials.password)
            .then(function (response) {
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
                $location.path(user.role === 'Admin' ? '/dashboard' : '/pos');
            })
            .catch(function () {
                $scope.errorMessage = 'Something went wrong, please try again';
            })
            .finally(function () {
                $scope.loading = false;
            });
    };

    $scope.totalPages = function () {
        return Math.ceil($scope.getFilteredUsers().length / $scope.pageSize);
    };

    $scope.getFilteredUsers = function () {
        var filtered = $scope.users;
        if ($scope.filterRole) {
            filtered = filtered.filter(function (u) {
                return u.role.toLowerCase().includes($scope.filterRole.toLowerCase());
            });
        }
        if ($scope.searchQuery) {
            var q = $scope.searchQuery.toLowerCase();
            filtered = filtered.filter(function (u) {
                return u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
            });
        }
        return filtered;
    };

    $scope.getPagedUsers = function () {
        var filtered = $scope.getFilteredUsers();
        var start = ($scope.currentPage - 1) * $scope.pageSize;
        return filtered.slice(start, start + $scope.pageSize);
    };

    $scope.getPages = function () {
        var pages = [];
        for (var i = 1; i <= $scope.totalPages(); i++) {
            pages.push(i);
        }
        return pages;
    };

    $scope.goToPage = function (page) {
        if (page < 1 || page > $scope.totalPages()) return;
        $scope.currentPage = page;
    };

    $scope.$watchGroup(['filterRole', 'searchQuery'], function () {
        $scope.currentPage = 1;
    });

    $scope.viewUser = function (user) {
        $scope.selectedUser = user;
        $scope.showModal = true;
    };

    $scope.closeModal = function () {
        $scope.showModal = false;
        $scope.selectedUser = {};
    };

    if ($location.path() !== '/login') {
        $scope.loadUsers();
    }
});