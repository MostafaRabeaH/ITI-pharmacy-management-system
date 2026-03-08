app.controller ("posController", function($scope, medicineService, customerService, invoiceService) {

		$scope.isLoading = true ; 
        $scope.inventory = [];
        $scope.customers = [];

    $scope.initPOS = ()=>{
        $scope.isLoading = true ;
        // 1st fetching the medcines data 
        return medicineService.getAllMedicines()
        .then((medResponse)=>{
            $scope.inventory = medResponse.data; 
            // 2nd fetching the customers data 
            return customerService.getAllCustomers();
        })
        .then((custResponse)=>{
            $scope.customers = custResponse.data;
            $scope.isLoading = false;
        })
        .catch((err)=>{
            console.error("Error fetching from the database ", err)
            alert("Error loading inventory items. Check your internet or console.");
            $scope.isLoading = false;
        });
    };
//  reset POS button func
    $scope.resetPOS = function() {
        $scope.cart = [];
        $scope.sale = {
            selectedCustomerId: null,
            paymentMethod: 'Cash',
            discount: 0,
            taxRate: 0.14,
            amountReceived: null,
            paidInFull: true
        };
        $scope.searchCustomerTemp = "";
        $scope.showCustomerDropdown = false;
        $scope.newCustomer = {};
        $scope.validationError = "";

        $scope.calculateTotals();
    };



        $scope.selectCustomer = function(customer) {
            $scope.sale.selectedCustomerId = customer.id;
            $scope.showCustomerDropdown = false;
            $scope.searchCustomerTemp = ""; 
        };

            $scope.clearCustomer = function() {
                $scope.sale.selectedCustomerId = null;
                $scope.searchCustomerTemp = "";
            };

    $scope.getSelectedCustomerName = function() {
        if (!$scope.sale.selectedCustomerId || !$scope.customers) return "";
        let c = $scope.customers.find(c => c.id === $scope.sale.selectedCustomerId);
        return c ? c.name : "";
    };

    $scope.getSelectedCustomerPhone = function() {
        if (!$scope.sale.selectedCustomerId || !$scope.customers) return "";
        let c = $scope.customers.find(c => c.id === $scope.sale.selectedCustomerId);
        return c ? (c.phone || "No phone") : "";
    };

    $scope.isSavingCustomer = false;
    $scope.saveNewCustomer = function() {
        $scope.isSavingCustomer = true;
        customerService.insertCustomer($scope.newCustomer)
        .then(function(response) {
            // refetching  customers to make suere we have the new ID 
            return customerService.getAllCustomers();
        })
        .then(function(custResponse) {
            $scope.customers = custResponse.data;
            
            // getting the new added customer based on name and phone
            let addedCustomer = $scope.customers.find(c => c.phone === $scope.newCustomer.phone && c.name === $scope.newCustomer.name);
            if (addedCustomer) {
                $scope.selectCustomer(addedCustomer);
            }
            
            $scope.isSavingCustomer = false;
            $scope.newCustomer = {}; // rest form
            
            // closing the bootstrap popup 
            let closeBtn = document.getElementById('closeNewCustomerModal');
            if(closeBtn) closeBtn.click();
        })
        .catch(function(err) {
            $scope.isSavingCustomer = false;
            console.error("Error adding customer:", err);
        });
    };

    // Cart 
    
    // this object to hold final numbers of the invoice 
    $scope.totals = {
        subtotal: 0,
        tax: 0,
        grandTotal: 0,
        change: 0
    };


// add to cart func
    $scope.isExpired = function(medicine) {
        if (!medicine.expiry_date) return false;
        let expiryDate = new Date(medicine.expiry_date);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        return expiryDate < today;
    };

    $scope.addToCart = function(medicine) {
        if ($scope.isExpired(medicine)) {
            $scope.validationError = "Cannot add expired item (" + medicine.name + ") to the cart.";
            return;
        }

        // Check if the medicine is already in the cart
        let existingItem = $scope.cart.find(function(item) {
            return item.id === medicine.id;
        });

        if (existingItem) {
            // If it's already in the cart qty + 1 
            existingItem.qty += 1;
        } else {
            // if  new will copy the medicine data and set quantity to 1

            //   angular.copy() so we don't  change the main array storing the inventory data 
            let newItem = angular.copy(medicine);
            newItem.qty = 1;
            $scope.cart.push(newItem);
        }
        
        $scope.calculateTotals(); 
    };

    // Reomiving from carrt
    
        $scope.removeFromCart = function(index) {
            $scope.cart.splice(index, 1); // to remove 1 item at a specific index
            $scope.calculateTotals();
        };

    // increasing or decreasing qty buttons 
    $scope.updateQty = function(item, amount) {
        item.qty += amount;
        if (item.qty < 1) {
            item.qty = 1; // to prevent qty from going below 1
        }
        $scope.calculateTotals();
    };



    $scope.calculateTotals = function() {
        let sub = 0;
        
        // to get  price * qty for each item in the cart 
        for (let i = 0; i < $scope.cart.length; i++) {
            sub += ($scope.cart[i].price * $scope.cart[i].qty);
        }

        $scope.totals.subtotal = sub;
        
        $scope.totals.tax = sub * $scope.sale.taxRate;
        
        $scope.totals.grandTotal = $scope.totals.subtotal + $scope.totals.tax - $scope.sale.discount;
        
        // to prevent the total from going below 0 
        if ($scope.totals.grandTotal < 0) {
            $scope.totals.grandTotal = 0;
        }

        // to make amount recived = total  if paid in full  is on 
        if ($scope.sale.paidInFull) {
            $scope.sale.amountReceived = $scope.totals.grandTotal;
        }

        // change calc
        if ($scope.sale.amountReceived >= $scope.totals.grandTotal) {
            $scope.totals.change = $scope.sale.amountReceived - $scope.totals.grandTotal;
        } else {
            $scope.totals.change = 0;
        }
    };

    // to make amount recived = total  if paid in full  is on 
    $scope.onPaidInFullChange = function() {
        if ($scope.sale.paidInFull) {
            $scope.sale.amountReceived = $scope.totals.grandTotal;
            $scope.calculateTotals();
        }
    };


// checkout func
    $scope.checkout = function() {
        
        $scope.validationError = ""; 
        
        // if cart is empty 
        if ($scope.cart.length === 0) {
            $scope.validationError = "The cart is empty Please add some medicines";
            return; 
        }

        if (!$scope.sale.selectedCustomerId) {
            $scope.validationError = "Please select a customer for this invoice or add a new one";
            return; 
        }

        // if amount received is empty 
        if ($scope.sale.amountReceived === null || $scope.sale.amountReceived === undefined || $scope.sale.amountReceived === "") {
            $scope.sale.amountReceived = $scope.totals.grandTotal;
            $scope.calculateTotals(); 
        }

        // if amount received is less than total 
        if ($scope.sale.paymentMethod === 'Cash' && $scope.sale.amountReceived < $scope.totals.grandTotal) {
            $scope.validationError = "The amount received is less than the total";
            return; 
        }

        const invoiceData = {
            customer_id: $scope.sale.selectedCustomerId,
            total_amount: $scope.totals.grandTotal,
            payment_method: $scope.sale.paymentMethod
        };

    // Map cart items to the correct field names expected by invoice_items table
        const mappedCartItems = $scope.cart.map(function(item) {
            return {
                medicine_id: item.id,
                quantity: item.qty,
                price: item.price
            };
        });

        // post invoice to the database using your service
        invoiceService.createFullInvoice(invoiceData, mappedCartItems)
            .then(function(newInvoice) {
                
                $scope.completedInvoice = {
                    id: newInvoice.id,
                    customerName: $scope.getSelectedCustomerName(),
                    date: newInvoice.created_at,
                    paymentMethod: $scope.sale.paymentMethod,
                    items: angular.copy($scope.cart),
                    totals: angular.copy($scope.totals),
                    discount: $scope.sale.discount,
                    amountReceived: $scope.sale.amountReceived
                };

                // update the stock level for each item in the cart
                for (let i = 0; i < $scope.cart.length; i++) {
                    let item = $scope.cart[i];
                    let newStockLevel = item.stock - item.qty;
                    if (newStockLevel < 0) {
                        newStockLevel = 0;
                    }
                    medicineService.updateMedicine(item.id, { stock: newStockLevel });
                }

                // Show success modal
                var myModal = new bootstrap.Modal(document.getElementById('checkoutSuccessModal'));
                myModal.show();
            })
            .catch(function(error) {
                console.error("Error saving invoice or updating stock:", error);
                $scope.validationError = "Failed to complete checkout. Please check the connection and console.";
            });
    };

    $scope.resetPOS();
    $scope.initPOS();

    $scope.closeReceiptModal = function() {
        var modalEl = document.getElementById('checkoutSuccessModal');
        var modalInstance = bootstrap.Modal.getInstance(modalEl);
        if(modalInstance) {
            modalInstance.hide();
        } else {
            var mb = bootstrap.Modal.getOrCreateInstance(modalEl);
            mb.hide();
        }
        
        var backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
        
        $scope.completedInvoice = null;
        $scope.initPOS().then(function() {
            $scope.resetPOS();
        });
    };
    
    // print PDF 
    $scope.printReceipt = function() {
        var element = document.getElementById('posReceiptToPrint');
        if (!element) return;
        
        var opt = {
            margin:       0.5,
            filename:     'receipt_' + $scope.completedInvoice.id + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    };

});