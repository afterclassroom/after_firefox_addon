self.port.on("InitContent", function(response) {
    var params_arr = [];
    $('#main_panel').html(response);
    var str_action = $(response).find('#form_signin').attr('action');
    
    params_arr.push(str_action);

    $('#main_panel').find('#btn_sign_in').click(function(){
        params_arr.push($('#main_panel').find('#user_email').val());
        params_arr.push($('#main_panel').find('#user_password').val());
        $('#main_panel').css('display','none');

        self.port.emit('SignIn', params_arr);
    });
    $('#main_panel').css('display','');
});

self.port.on("AfterSignin", function(response) {
    console.log('after signin');
    $('#main_panel').html(response);
    $('#main_panel').css('display','');
});
