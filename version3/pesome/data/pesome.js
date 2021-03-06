var loading_Image = '<img src="../img/loading.gif" style="padding:250px 230px"/>';

self.port.on("InitContent", function(response) {
    $('#main_panel').html(loading_Image);

    $('#main_panel').css('display','');

    var params_arr = [];
    $('#main_panel').html(response);
    var str_action = $(response).find('#form_signin').attr('action');


    if (str_action == undefined){
        PostLinkHandler(response);
    }else {
        params_arr.push(str_action);

        //        $('#main_panel').find('#btn_sign_in').click(function(){
        $('#main_panel').find('.btn-signin').click(function(){
            params_arr.push($('#main_panel').find('#user_email').val());
            params_arr.push($('#main_panel').find('#user_password').val());
            $('#main_panel').html(loading_Image);

            self.port.emit('SignIn', params_arr);
        });

    }
});


self.port.on("AfterSignin", function(response) {
    PostLinkHandler(response);
});


self.port.on("ResetPage", function(response) {
    $('#main_panel').html(loading_Image);
});

self.port.on("AfterCreate", function(response) {
    $('#main_panel').html(response);
    //BEGIN link SIGNOUT handler
    var str_link =  $('#main_panel').find('.signout').attr('href');
    $('#main_panel').find('.signout').attr('href','javascript:;');

    $('#main_panel').find('.signout').click(function(){
        self.port.emit('SignOut', str_link);
    });
//END link SIGNOUT handler
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
    //BEGIN HANDLER for checkbox click and reclick
    $('#main_panel').find('#fldcheckbox').click(function(){
        if($(this).is(':checked'))
        {
            $('#main_panel').find('#images_carousel').hide();
        }
        else
        {
            $('#main_panel').find('#images_carousel').show();
        }
    });
    //END HANDLER for checkbox click and reclick
    //BEGIN HANDLER FOR CAROUSEL
    if ($('#main_panel').find("#images_carousel").length > 0){
        var slider = $('#main_panel').find("#images_carousel")
        .carousel({
            interval: 5000000
        }).bind('slid', function() {
            $('#main_panel').find('#link_image').val($('#main_panel').find('div.carousel-inner div.active img').attr('src'));
        });
    }
    //END HANDLER FOR CAROUSEL

    var str_action = $('#main_panel').find('#form_tick').attr('action');
    $('#main_panel').find('#send_bt').click(function(){
        //BEGIN validation for valid form before submit
        if ( $('input[name="classroom_ids[]"]:checked').length > 0 ){
            //            var cls_list = [];
            var params_arr = [];
            //            $('input[name="classroom_ids[]"]:checked').each(function(i){
            //                cls_list.push($(this).val());
            //            });
            //            var tags = $('#tags').val();
            //            params_arr.push(cls_list);
            //            params_arr.push(tags);
            //
            //            if ($('#main_panel').find('#title').val() != '' ){
            //                params_arr.push($('#title').val());
            //            } else {
            //                params_arr.push("No title");
            //            }
            //BEGIN handle checkbox No thumbnail
            
            if ($('#main_panel').find('#fldcheckbox').is(':checked')) {
                $('#link_image').remove();
            }
            //LOADING WAIT...
            params_arr.push(str_action);
            var values = $('#main_panel').find('#form_tick').serialize();
            params_arr.push(values);

            $('#main_panel').html(loading_Image);
            self.port.emit('SubmitTick', params_arr);
        }else {
            $('#alertModal').modal('show');
        }
    //END validation for valid form before submit
    });
    
    //BEGIN link handler
    var str_link =  $('#main_panel').find('.signout').attr('href');
    $('#main_panel').find('.signout').attr('href','javascript:;');
    var mypost_link = $('#main_panel').find('.myTick').attr('href');
    $('#main_panel').find('.myTick').attr('href','javascript:;');
    var home_link = $('#main_panel').find('#linkto_classroom').attr('href');
    $('#main_panel').find('#linkto_classroom').attr('href','javascript:;');
    var original_link = $('#main_panel').find('#link').attr('href');
    $('#main_panel').find('#link').attr('href','javascript:;');

    $('#main_panel').find('.signout').click(function(){
        self.port.emit('SignOut', str_link);
    });
    $('#main_panel').find('.myTick').click(function(){
        self.port.emit('GotoLink', mypost_link);
    });
    $('#main_panel').find('#linkto_classroom').click(function(){
        self.port.emit('GotoLink', home_link);
    });
    $('#main_panel').find('#link').click(function(){
        self.port.emit('GotoLink', original_link);
    });
    //END link handler

    
    $('#main_panel').css('display','');

}
