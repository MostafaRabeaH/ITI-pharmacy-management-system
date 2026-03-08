app.controller('invoiceController', function($scope, invoiceService) {

    $scope.invoices = [];
    $scope.isLoading = true;
    $scope.searchInvoice = "";
    $scope.filterPayment = "";
    $scope.sortInvoices = "-created_at"; // will sort it desc
    
    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.pageSizeOptions = [5, 10, 15, 20, 25, 50];

    // get all invoices
    $scope.loadInvoices = function() {
        $scope.isLoading = true;
        invoiceService.getAllInvoices()
        .then(function(response) {
            $scope.invoices = response.data;
            $scope.isLoading = false;
        })
        .catch(function(error) {
            console.error("Error loading invoices:", error);
            $scope.isLoading = false;
        });
    };

    $scope.loadInvoices();

    // pagination
    $scope.totalPages = function(totalItems) {
        return Math.ceil(totalItems / $scope.pageSize) || 1;
    };

    $scope.nextPage = function(totalItems) {
        if ($scope.currentPage < $scope.totalPages(totalItems)) {
            $scope.currentPage++;
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

    // invoice deetails bootstrap pop up 
    $scope.selectedInvoice = null;
    $scope.invoiceItems = [];
    $scope.isLoadingItems = true;

    $scope.viewInvoice = function(invoice) {
        $scope.selectedInvoice = invoice;
        $scope.invoiceItems = [];
        $scope.isLoadingItems = true;

        invoiceService.getInvoiceItems(invoice.id)
        .then(function(response) {
            $scope.invoiceItems = response.data;
            $scope.isLoadingItems = false;
        })
        .catch(function(error) {
            console.error("Error loading invoice items:", error);
            $scope.isLoadingItems = false;
        });
    };

    // print PDF 
    $scope.downloadPDF = function() {
        var element = document.getElementById('invoiceToPrint');
        if (!element) return;
        
        var opt = {
            margin:       0.5,
            filename:     'invoice_' + $scope.selectedInvoice.id + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    };

});
