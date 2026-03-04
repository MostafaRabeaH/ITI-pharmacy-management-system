app.service("customerService", function($http) {

    const apiLink = "https://iineuokzjdasyzkqebmz.supabase.co/rest/v1/customers";
    const apiKey = "sb_publishable_Qcr-0dfUhcsqqT5zdtkfDA_XZeErAFq";
    const headers = {
        'apikey' : apiKey,
        'Authorization': 'Bearer ' + apiKey, 
        'Content-Type' : 'application/json'
    };
    
    this.getAllCustomers = function() {
        return $http.get(apiLink, {headers : headers});
    };
    
    this.insertCustomer = (newCustomerData) => {
        return $http.post(apiLink, newCustomerData, { headers: headers});
    };
    
    this.deleteCustomer = function(customerId) {
        const deleteUrl = apiLink + "?id=eq." + customerId;
        return $http.delete(deleteUrl, {headers: headers});
    };
    
    this.updateCustomer = function(customerId, updateData) {
        const updateUrl = apiLink + "?id=eq." + customerId;
        return $http.patch(updateUrl, updateData, { headers: headers });          
    };

    this.getCustomerById = function(customerId) {
        const url = apiLink + "?id=eq." + customerId;
        return $http.get(url, { headers: headers });
    };

});