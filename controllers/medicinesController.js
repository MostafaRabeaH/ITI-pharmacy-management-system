app.controller("medicinesController", function ($scope, $location, $timeout, medicineService) {
    $scope.medicines = [];
    $scope.loading = false;
    $scope.newMedicineData = {};
    $scope.isEdit = false;
    $scope.filterStatus = '';
    $scope.formSubmitted = false;
    $scope.currentPage = 1;
    $scope.pageSize = 5;
    $scope.showModal = false;
    $scope.selectedMedicine = {};
    var editData = localStorage.getItem('editMedicine');
    
    $scope.loadMedicines = function () {
        $scope.loading = true;
        medicineService.getAllMedicines().then(function (response) {
            $scope.medicines = response.data;
            $scope.loading = false;
        });
    };

    if (editData) {
        $scope.isEdit = true;
        $scope.newMedicineData = JSON.parse(editData);


        if ($scope.newMedicineData.expiry_date) {
            var parts = $scope.newMedicineData.expiry_date.split('-');
            $scope.newMedicineData.expiry_date = new Date(parts[0], parts[1] - 1, parts[2]);
        }

        localStorage.removeItem('editMedicine');
    }

    $scope.editMedicine = function (medicineId) {
        console.log('editMedicine called with id:', medicineId);
        medicineService.getMedicineById(medicineId).then(function (response) {
            console.log('medicine data:', response.data);
            localStorage.setItem('editMedicine', JSON.stringify(response.data[0]));
            $location.path('/medicine-form');
        });
    };

    $scope.addMedicine = function () {

        if ($scope.selectedFile) {
            $scope.newMedicineData.image_url = 'assets/images/medicines/' + $scope.selectedFile.name;
        }

        medicineService.insertMedicine($scope.newMedicineData).then(function () {
            $scope.newMedicineData = {};
            $scope.selectedFile = null;
            $scope.selectedFileName = '';
            $location.path('/medicines-list');
        });
    };

    $scope.deleteMedicine = function (medicineId) {
        if (!confirm("Delete this medicine?")) return;
        medicineService.deleteMedicine(medicineId).then(function () {
            $scope.loadMedicines();
        });
    };

    $scope.cancelEdit = function () {
        $scope.isEdit = false;
        $scope.newMedicineData = {};
        localStorage.removeItem('editMedicine');
        $location.path('/medicines-list');
    };

    $scope.updateMedicine = function () {
        var dataToSend = angular.copy($scope.newMedicineData);


        if ($scope.selectedFile) {
            dataToSend.image_url = 'assets/images/medicines/' + $scope.selectedFile.name;
        }

        if (dataToSend.expiry_date instanceof Date) {
            var d = dataToSend.expiry_date;
            var month = ('0' + (d.getMonth() + 1)).slice(-2);
            var day = ('0' + d.getDate()).slice(-2);
            dataToSend.expiry_date = d.getFullYear() + '-' + month + '-' + day;
        }

        medicineService.updateMedicine(dataToSend.id, dataToSend).then(function () {
            localStorage.removeItem('editMedicine');
            $scope.selectedFile = null;
            $scope.selectedFileName = '';
            $location.path('/medicines-list');
        });
    };

    $scope.getMedicineById = function (medicineId) {
        medicineService.getMedicineById(medicineId).then(function (response) {
            $scope.newMedicineData = response.data[0];
            $scope.newMedicineData.expiry_date = new Date($scope.newMedicineData.expiry_date);
        })
    }
    $scope.getStatus = function (medicine) {
        var today = new Date();
        var expDate = new Date(medicine.expiry_date);
        if (expDate < today) return 'Expired';
        if (medicine.stock === 0) return 'Out of Stock';
        if (medicine.stock > 0 && medicine.stock <= 10) return 'Low Stock';
        return 'In Stock';
    };

    $scope.filterByStatus = function (medicine) {
        if (!$scope.filterStatus) return true;
        return $scope.getStatus(medicine) === $scope.filterStatus;
    };

    $scope.onFileSelected = function (input) {
        var file = input.files[0];
        if (!file) return;

        $scope.selectedFileName = file.name;


        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.$apply(function () {
                $scope.newMedicineData.image_url = e.target.result;
                $scope.selectedFile = file;
            });
        };
        reader.readAsDataURL(file);
    };

    $scope.submitForm = function (form) {
        $scope.formSubmitted = true;

        angular.forEach(form, function (field) {
            if (typeof field === 'object' && field.hasOwnProperty('$modelValue')) {
                field.$setTouched();
            }
        });

        if (form.$invalid || !$scope.newMedicineData.unit_type) return;

        if ($scope.isEdit) {
            $scope.updateMedicine();
        } else {
            $scope.addMedicine();
        }
    };

    $scope.totalPages = function () {
        return Math.ceil($scope.getFilteredMedicines().length / $scope.pageSize);
    };

    $scope.getFilteredMedicines = function () {
        var filtered = $scope.medicines;


        if ($scope.filterCategory) {
            filtered = filtered.filter(function (m) {
                return m.category === $scope.filterCategory;
            });
        }


        if ($scope.filterStatus) {
            filtered = filtered.filter(function (m) {
                return $scope.getStatus(m) === $scope.filterStatus;
            });
        }


        if ($scope.searchQuery) {
            var q = $scope.searchQuery.toLowerCase();
            filtered = filtered.filter(function (m) {
                return m.name.toLowerCase().includes(q) ||
                    m.category.toLowerCase().includes(q) ||
                    m.scientific_name.toLowerCase().includes(q);
            });
        }

        return filtered;
    };

    $scope.getPagedMedicines = function () {
        var filtered = $scope.getFilteredMedicines();
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

    $scope.$watchGroup(['filterCategory', 'filterStatus', 'searchQuery'], function () {
        $scope.currentPage = 1;
    });

    $scope.viewMedicine = function (medicine) {
        $scope.selectedMedicine = medicine;
        $scope.showModal = true;
    };

    $scope.closeModal = function () {
        $scope.showModal = false;
        $scope.selectedMedicine = {};
    }
    $scope.loadMedicines();
});