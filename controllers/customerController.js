app.controller ('customerController', function($scope,customerService,$routeParams, $location ){

    $scope.customers = [];
    $scope.selectedCustomer ={};
    $scope.isLoading = true ;
    $scope.currentPage = 1 ;
    $scope.pageSize = 10 ;
    $scope.pageSizeOptions = [5, 10, 15, 20, 25, 50];

    $scope.loadCustomers = ()=>{
            $scope.isLoading = true ;
        customerService.getAllCustomers()
        .then (function(response){
            $scope.customers = response.data;
            $scope.isLoading= false;
        })
        .catch(function(error){
            console.error("Error loading data ", error)
             $scope.isLoading= false; 
        });

    };

    $scope.loadCustomers();

    // pagination 
    $scope.totalPages = function(totalItems){
        return Math.ceil(totalItems / $scope.pageSize) || 1;
    };

    $scope.nextPage = function(totalItems){
        if ($scope.currentPage < $scope.totalPages(totalItems)){
            $scope.currentPage ++;
        }
    };

    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
        }
    };

    $scope.onPageSizeChange = function() {
        $scope.currentPage = 1;
    };

    $scope.showingFrom = function(totalItems) {
        if (totalItems === 0) return 0;
        return (($scope.currentPage - 1) * $scope.pageSize) + 1;
    };

    $scope.showingTo = function(totalItems) {
        var end = $scope.currentPage * $scope.pageSize;
        return end > totalItems ? totalItems : end;
    };

    $scope.deleteCustomer = function(customerId){

    let isConfirmed = confirm("Are u sure u want to delete this customer ???");

    if(isConfirmed){
        customerService.deleteCustomer(customerId)
        .then (function(response){
            $scope.loadCustomers()
            alert("Customer was deleted successfully")
        })
        .catch (function(err){
            console.error("Error happend check database connectoin ", err);
            alert("Error check console ")
        })
    }
};

$scope.customerId = $routeParams.id; // to check if id exists we are in the edit mode else will add a new custoemr 

$scope.customer = {};

if($scope.customerId){
    customerService.getCustomerById($scope.customerId)
    .then((response)=>{
        if(response.data && response.data.length > 0){
            $scope.customer = response.data[0];

        }
    })
    .catch((err) => {
        console.error("Error fetching customer details : ", err)
    });
}

// save fucn()

    $scope.saveCustomer = ()=>{
        if ($scope.customerId ){
            customerService.updateCustomer($scope.customerId , $scope.customer)
            .then((response) => {
                alert("Customer updated successfully!");
                $location.path("/customers-list"); // this will send the user back to custoemrs page 
            })
            .catch((err) =>{
                console.error("Error updating customer:", err);
            } );
        } else {
            customerService.insertCustomer($scope.customer)
            .then((response) => {
                alert("Customer added successfully!");
                $location.path("/customers-list"); // this will send the user back to customers page
            })
            .catch((err) => {
                console.error("Error adding customer:", err);
            });
        }
    };

    // this fucntion copy the data form the selected customer when user press on eye icon 
    $scope.selectCustomer = function(customer) {
        $scope.selectedCustomer = customer; 
    };

});


