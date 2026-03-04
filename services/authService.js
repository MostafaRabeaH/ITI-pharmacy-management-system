app.service("userService", function($http) {

    const apiLink = "https://iineuokzjdasyzkqebmz.supabase.co/rest/v1/users";
    const apiKey = "sb_publishable_Qcr-0dfUhcsqqT5zdtkfDA_XZeErAFq";
    const headers = {
        'apikey' : apiKey,
        'Authorization': 'Bearer ' + apiKey, 
        'Content-Type' : 'application/json'
    };
    
    // geting all users from the supabase table
    this.getAllUsers = function() {
        return $http.get(apiLink, {headers : headers});
    };
    
    // to create a new user that the admin only will be able to 
    this.insertUser = (newUserData) => {
        return $http.post(apiLink, newUserData, { headers: headers});
    };
    
    // deleting 
    this.deleteUser = function(userId) {
        const deleteUrl = apiLink + "?id=eq." + userId;
        return $http.delete(deleteUrl, {headers: headers});
    };
    
    // update for exampel changing the user passwrod 
    this.updateUser = function(userId, updateData) {
        const updateUrl = apiLink + "?id=eq." + userId;
        return $http.patch(updateUrl, updateData, { headers: headers });          
    };

    // getting a user by id 
    this.getUserById = function(userId) {
        const url = apiLink + "?id=eq." + userId;
        return $http.get(url, { headers: headers });
    };

    // this func checks for the login using the users table 
    this.loginUser = function(username, password) {
        const loginUrl = apiLink + "?username=eq." + username + "&password=eq." + password + "&select=*";
        return $http.get(loginUrl, { headers: headers });
    };

});