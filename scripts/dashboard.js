$(document).ready(function(){
    console.log("\n\nTHE SCRIPT WAS LOADED!!!!   (dashboard.js)\n\n")
    var socket = io();
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.on('newClientData', function (data) {
    console.log('SOCKET on newClientData!      ( index.html )   ')
    $("#displayData div").remove(); 
    if (data != null) {
        var data = JSON.parse(data); //process notication array

     Object.keys(data).forEach(function (username) {
             
             dropdownOptions =  '<div class="nav-item dropdown" style="float: right;">' + 
                                     '<a class="nav-link" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span><img src="/assets/glyphicons-137-cogwheel.png" width="16px" height="16px"></span></a>' + 
                                     '<div class="dropdown-menu" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 40px, 0px);">' + 
                                         '<a class="dropdown-item editUser" href="#editUser' + username + '" id="editUser' + username + '">Edit Client</a>' + 
                                         '<a class="dropdown-item deleteUser" href="#deleteUser' + username + '" id="deleteUser' + username + '">Delete Client</a>' + 
                                     '</div>' + 
                                 '</div>'

             $('#displayData').append('<div class="card border-info mb-3" style="max-width: 20rem;">' + 
                     '<div class="card-header"><strong>' + username + dropdownOptions + '</strong></div>' + 
                     '<div class="card-body">' + 
                     ' <h4 class="card-title">Account Info</h4>' + 
                         '<p class="card-text"><strong>User:</strong> ' + username + "<br /><strong>Email:</strong> " + data[username].email + "<br /><strong>Phone:</strong> " + data[username].phone + "<br /><strong>Account:</strong> " + data[username].account + '</p>' + 
                         '<input type="hidden" name="hiddenEmail' + username + '" id="hiddenEmail' + username + '" value="' + data[username].email + '">' +
                         '<input type="hidden" name="hiddenPhone' + username + '" id="hiddenPhone' + username + '" value="' + data[username].phone + '">' +
                         '<input type="hidden" name="hiddenAccount' + username + '" id="hiddenAccount' + username + '" value="' + data[username].account + '">' +
                     
                 '</div>' + 
                 '</div>');
        });
    }
    });

    $('#displayData').on('click','div div strong div div a.editUser', function() {
    clientUserName = this.id.substring(8);
    $("#modalDataDiv").html("You have chosen to EDIT the user: <strong>" + clientUserName + "</strong>");
    $("#decisionModalButton").html("EDIT");
    $("#modalTitle").html("<strong>Edit User: " + clientUserName + "</strong>");
    $("#decisionModalButton").removeClass("btn-outline-danger");
    $("#decisionModalButton").addClass("btn-outline-success");
    document.getElementById('hiddenUsername').value = clientUserName;
    $("#modalDialog").modal();

    });

    $('#displayData').on('click','div div strong div div a.deleteUser', function() {
    clientUserName = this.id.substring(10);
    $("#modalDataDiv").html("You have chosen to DELETE the user: <strong>" + clientUserName + "</strong><br />Are you sure you want to follow through with this? <br /><strong>This action is irreversible.</strong>");
    $("#decisionModalButton").html("DELETE");
    $("#modalTitle").html("<strong>Delete User: " + clientUserName + "</strong>");
    $("#decisionModalButton").removeClass("btn-outline-success");
    $("#decisionModalButton").addClass("btn-outline-danger");
    document.getElementById('hiddenUsername').value = clientUserName;
    $("#modalDialog").modal()

    });

    $("#decisionModalButton").on('click', function() {
    action = $("#decisionModalButton").text();
    username = $('#hiddenUsername').val();
    switch (action) {
        case "EDIT":
            $("#modalDialog").modal('hide');
            email = $('#hiddenEmail' + username).val();
            phone = $('#hiddenPhone' + username).val();
            account = $('#hiddenAccount' + username).val();
            $('#modalEDIT-account').val(account);
            $('#modalEDIT-email').val(email);
            $('#modalEDIT-phone').val(phone);    
            $('#modalEDIT-username').html(username)
            $("#modalEDIT").modal();
            break;
        case "DELETE":
            socket.emit('deleteAccount', username);
            $("#modalDialog").modal('hide');
            break;
        default:
            $("#modalDialog").modal('hide');    
            alert("switch default.... something went wrong... ");
            
    }
    });

    $("#submitEditModalButton").on('click', function() {
        username = $('#modalEDIT-username').text()
        account = $('#modalEDIT-account').val();
        email = $('#modalEDIT-email').val();
        phone = $('#modalEDIT-phone').val(); 
        userInfo = {
            "username": username,
            "account": account,
            "email": email,
            "phone": phone 
        } 
        $("#modalEDIT").modal('hide');
        socket.emit('editAccount', userInfo);
    });

    $("#submitAddNewClientModal").on('click', function() {
        username = $('#addNewClientModal-username').val()
        account = $('#addNewClientModal-account').val();
        email = $('#addNewClientModal-email').val();
        phone = $('#addNewClientModal-phone').val(); 
        userInfo = {
            "username": username,
            "account": account,
            "email": email,
            "phone": phone 
        } 
        $("#addNewClientModal").modal('hide');
        socket.emit('createAccount', userInfo);
        cleanseNewUserModal();
    });


    $('#addNewClientModal-username').keyup(function(){
        str = $(this).val();
        str = str.replace(/\s/g,'');
        $(this).val(str); 
    });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



socket.on('onUserData', function (data) {
    console.log('SOCKET on onUserData!      ( index.html )   ')
    $("#displayUserData div").remove(); 
    if (data != null) {
        // var data = JSON.parse(data); //process notication array

     Object.keys(data).forEach(function (user) {
         console.log(user[data]);

            //  $('#displayData').append('<div class="card border-info mb-3" style="max-width: 20rem;">' + 
            //          '<div class="card-header"><strong>' + username + '</strong></div>' + 
            //          '<div class="card-body">' + 
            //          ' <h4 class="card-title">Account Info</h4>' + 
            //              '<p class="card-text"><strong>User:</strong> ' + username + "<br /><strong>Email:</strong> " + data[username].email + "<br /><strong>Phone:</strong> " + data[username].phone + "<br /><strong>Account:</strong> " + data[username].account + '</p>' + 
            //              '<input type="hidden" name="hiddenEmail' + username + '" id="hiddenEmail' + username + '" value="' + data[username].email + '">' +
            //              '<input type="hidden" name="hiddenPhone' + username + '" id="hiddenPhone' + username + '" value="' + data[username].phone + '">' +
            //              '<input type="hidden" name="hiddenAccount' + username + '" id="hiddenAccount' + username + '" value="' + data[username].account + '">' +
                     
            //      '</div>' + 
            //      '</div>');
        });
    }
    });








///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.emit('loadData');
});



// functions
function addNewClient() {
    cleanseNewUserModal();
    $("#addNewClientModal").modal();
    }
    function cleanseNewUserModal(){
    $('#addNewClientModal-username').val("");
    $('#addNewClientModal-account').val("");
    $('#addNewClientModal-email').val("");
    $('#addNewClientModal-phone').val("");
}

// function logout() {
//     firebase.auth().signOut()
//     .then(function() {
//         // Sign-out successful.
//         window.location.replace('/login');
//     })
//     .catch(function(error) {
//         // An error happened
//     });
// }