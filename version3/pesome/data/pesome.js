self.port.on("InitContent", function(response) {
    var params_arr = [];
    $('#main_panel').html(response);
    var str_action = $(response).find('#form_signin').attr('action');
    params_arr.push(str_action);
    $('#main_panel').find('#btn_sign_in').click(function(){
        self.port.emit('SignIn', str_action);
    });
    $('#main_panel').css('display','');
});