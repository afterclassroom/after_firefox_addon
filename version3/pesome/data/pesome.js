self.port.on("InitContent", function(response) {
    var params_arr = [];
    $('#main_panel').html(response);
    var str_action = $(response).find('#form_signin').attr('action');

    console.log('action == ');
    console.log('action == '+str_action);

    if (str_action == undefined){
        console.log('co the post link duoc');
        console.log('co the post link duoc');
        console.log('co the post link duoc');
        PostLinkHandler(response);
    }else {
        params_arr.push(str_action);

        $('#main_panel').find('#btn_sign_in').click(function(){
            params_arr.push($('#main_panel').find('#user_email').val());
            params_arr.push($('#main_panel').find('#user_password').val());
            $('#main_panel').css('display','none');

            self.port.emit('SignIn', params_arr);
        });
        $('#main_panel').css('display','');
    }
});


self.port.on("AfterSignin", function(response) {
    PostLinkHandler(response);
});


self.port.on("ResetPage", function(response) {
    $('#main_panel').css('display','none');
});

self.port.on("AfterCreate", function(response) {
    $('#main_panel').html(response);
});

function PostLinkHandler(response){

    $('#main_panel').html(response);
    //BEGIN: handler for petopics list

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
    //END: handler for petopics list
    //BEGIN: handler for select2 of tags

    if ($('#main_panel').find("#tags").length > 0) {
        $('#main_panel').find("#tags").select2({
            tags : $('#main_panel').find('#tag_list').val().split(',')
        });
    }
    //END: handler for select2 of tags

    var str_action = $('#main_panel').find('#form_tick').attr('action');
    $('#main_panel').find('#sub_tick').click(function(){
        //BEGIN validation for valid form before submit
        if ( $('input[name="classroom_ids[]"]:checked').length > 0 ){
            var cls_list = [];
            var params_arr = [];
            $('input[name="classroom_ids[]"]:checked').each(function(i){
                cls_list.push($(this).val());
            });
            var tags = $('#tags').val();
            params_arr.push(cls_list);
            params_arr.push(tags);

            if ($('#main_panel').find('#title').val() != '' ){
                params_arr.push($('#title').val());
            } else {
                params_arr.push("No title");
            }
            params_arr.push(str_action);
            self.port.emit('SubmitTick', params_arr);
        }else {
            $('#alertModal').modal('show');
        }
    //END validation for valid form before submit
    });
    
    //BEGIN link SIGNOUT handler
    var str_link =  $('#main_panel').find('.signout').attr('href');
    $('#main_panel').find('.signout').attr('href','javascript:;');

    $('#main_panel').find('.signout').click(function(){
        console.log('sign url == ');
        console.log('sign url == '+str_link);
        console.log('ole url == '+$('#main_panel').find('.signout').attr('href'));
        self.port.emit('SignOut', str_link);
    });
    //END link SIGNOUT handler

    
    $('#main_panel').css('display','');

}