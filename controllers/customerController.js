app.controller ('customerController', function($scope,customerService, invoiceService, $routeParams, $location ){

    $scope.customers = [];
    $scope.selectedCustomer ={};
    $scope.isLoading = true ;
    $scope.currentPage = 1 ;
    $scope.pageSize = 10 ;
    $scope.pageSizeOptions = [5, 10, 15, 20, 25, 50];

    
    $scope.loadCustomers = function() { 
        $scope.isLoading = true;
        // 1st getting customers data 
    customerService.getAllCustomers()
        .then(function(custResponse) {
        let customers = custResponse.data;
        
        // then fetching invoices data from invoiceService to calc the total spent per customer 
        invoiceService.getAllInvoices()
        .then(function(invResponse) {
            let invoices = invResponse.data ; // the returned data form the service  stored in a varibale 

            // looping over the invoices to get the sum spent per customer 
            let spentByCustomer = {}; 
            for (let i = 0; i < invoices.length; i++) {
                let invoice = invoices[i];
                if (invoice.customer_id) {

                    let currentTotal = spentByCustomer[invoice.customer_id] || 0;
                    let invoiceAmount = invoice.total_amount || 0;

                    spentByCustomer[invoice.customer_id] = currentTotal + invoiceAmount;
                }
            }

            // adding total for  each customer in the customers array 
            for (let j = 0; j < customers.length; j++) {
                let customer = customers[j];
                customer.total_spent = spentByCustomer[customer.id] || 0;
            }
            $scope.customers = customers;
            $scope.isLoading = false;
        })
        .catch(function(err){
            console.error("Error loading customers: ", err);
            $scope.isLoading= false;
        });
        })

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


