self.port.on("InitContent", function(response) {
    var params_arr = [];
    $('#main_panel').html(response);
    var str_action = $(response).find('#form_signin').attr('action');
    
    params_arr.push(str_action);

    $('#main_panel').find('#btn_sign_in').click(function(){
        console.log('us name '+$('#main_panel').find('#user_email').val());
        console.log('us psw '+$('#main_panel').find('#user_password').val());
        console.log('');
        params_arr.push($('#main_panel').find('#user_email').val());
        params_arr.push($('#main_panel').find('#user_password').val());


        self.port.emit('SignIn', params_arr);
    });
    $('#main_panel').css('display','');
});