app.service("invoiceService", function($http) {

    const apiLinkInvoices = "https://iineuokzjdasyzkqebmz.supabase.co/rest/v1/invoices";
    const apiLinkInvoiceItems = "https://iineuokzjdasyzkqebmz.supabase.co/rest/v1/invoice_items";
    const apiKey = "sb_publishable_Qcr-0dfUhcsqqT5zdtkfDA_XZeErAFq";
    
    const headers = {
        'apikey' : apiKey,
        'Authorization': 'Bearer ' + apiKey, 
        'Content-Type' : 'application/json'
    };

    // this  header supabase requires for post requests to return the generated id from the inovices table so we can use later in the invoice_items
    const postHeaders = {
        'apikey' : apiKey,
        'Authorization': 'Bearer ' + apiKey, 
        'Content-Type' : 'application/json',
        'Prefer': 'return=representation' 
    };
    
    // get all invoices 
    this.getAllInvoices = function() {
        const url = apiLinkInvoices + "?select=*,customers(name)"; // this relation to fetch the customer name from customers table
        return $http.get(url, {headers : headers});
    };

    // get  specific items for 1 invoice 
    this.getInvoiceItems = function(invoiceId) {
        const url = apiLinkInvoiceItems + "?invoice_id=eq." + invoiceId + "&select=*,medicines(name)"; // this returns the medcine name based on the relation between the medcinces table and invoices_items table 
        return $http.get(url, {headers : headers});
    };
    
    // this func creates the whole imvoice details and post it to the database 
    this.createFullInvoice = function(invoiceData, cartItems) {
        // 1- inserting the main invoice
        return $http.post(apiLinkInvoices, invoiceData, { headers: postHeaders })
            .then(function(response) {
                // Supabase returns an array  for the new invoice
                const newInvoice = response.data[0]; 
                
                //  2- map each cart item and attach the new invoice_id
                const itemsToInsert = cartItems.map(function(item) {
                    return {
                        invoice_id: newInvoice.id,
                        medicine_id: item.medicine_id,
                        quantity: item.quantity,
                        unit_price: item.price,
                        sub_total: item.quantity * item.price
                    };
                });

                // 3- bulk insert all items into invoice_items table
                return $http.post(apiLinkInvoiceItems, itemsToInsert, { headers: headers })
                    .then(function() {
                        return newInvoice;
                    });
            });
    };

});