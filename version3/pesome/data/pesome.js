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
    $('#main_panel').html(response);
    
    var timeout;

    function hidepanel() {
        $('#main_panel').find('#tick_to_click').hide();
    }

    function doTimeout() {
        clearTimeout(timeout);
        timeout = setTimeout(hidepanel, 100);
    }
    $('#main_panel').find('.click-ctick').click(function() {
        clearTimeout(timeout);
        $('#main_panel').find("#tick_to_click").show();
    });
    
    $('#main_panel').find('#tick_to_click').mouseleave(doTimeout);


    $('#main_panel').css('display','');

});
