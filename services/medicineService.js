app.service("medicineService", function($http) {

    const apiLink = "https://iineuokzjdasyzkqebmz.supabase.co/rest/v1/medicines";
    const apiKey = "sb_publishable_Qcr-0dfUhcsqqT5zdtkfDA_XZeErAFq";
    const headers = {
        'apikey' : apiKey,
        'Authorization': 'Bearer ' + apiKey, 
        'Content-Type' : 'application/json'
    };
    
    // get all medicines both admin and cashier can use it  
    this.getAllMedicines = function() {
        return $http.get(apiLink, {headers : headers});
    };
    
    // add a new medicine only admin can use it  
    this.insertMedicine = (newMedicineData) => {
        return $http.post(apiLink, newMedicineData, { headers: headers});
    };
    
    // dlete only admin can use it 
    this.deleteMedicine = function(medicineId) {
        const deleteUrl = apiLink + "?id=eq." + medicineId;
        return $http.delete(deleteUrl, {headers: headers});
    };
    
    // update a medicine to edit the product details or update the stock level after a sale  
    this.updateMedicine = function(medicineId, updateData) {
        const updateUrl = apiLink + "?id=eq." + medicineId;
        return $http.patch(updateUrl, updateData, { headers: headers });          
    };

    // gt a specific medicine by id
    this.getMedicineById = function(medicineId) {
        const url = apiLink + "?id=eq." + medicineId;
        return $http.get(url, { headers: headers });
    };

});

