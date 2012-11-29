var pp = function(o) {
    return JSON.stringify(o,null,'  ')
};

exports.main = function(options) {
    const data = require("self").data;
    var activeUrl = "";
    var URL = 'http://localhost:3000';
    //var URL = 'http://dev.afterclassroom.com';
    //    var URL = 'http://pesome.com';




    var after_panel = require("panel").Panel({
        width: 565,
        height: 565,
        contentURL: data.url("pages/index.html"),
        contentScriptFile: [data.url("jquery-1.7.1.min.js")
        ,data.url("pesome.js")
        ,data.url("select2.js")
        ,data.url("bootstrap-modal.js")
        //        ,data.url("firefox_oauth2.js")
        
        ],
        onShow: function() {
            after_panel.port.emit('ResetPage', null);
            activeUrl = require("tabs").activeTab.url;
            PesomeInit();
        },
        onHide: function() {
            after_panel.port.emit('ResetPage', null);
        }
    });

    var btn = require("toolbarbutton").ToolbarButton({
        id: 'my-toolbar-button',
        label: 'PeTick',
        tooltiptext: 'PeTick',
        image: data.url('img/icon_16.png'),
        panel: after_panel,
        onCommand: function() {
            btn.showPanel();
        //after_panel.port.emit('beginOauth', null);
        //            activeUrl = require("tabs").activeTab.url;
        }
    });
    if (options.loadReason === "startup") {
        btn.moveTo({
            toolbarID: "nav-bar",
            forceMove: false //only move from palette
        });
    }
    after_panel.port.on("SignIn", function(params_arr) {
        var Request = require('request').Request;

        Request({
            url: params_arr[0],
            content: {
                user: {
                    email: params_arr[1],
                    password: params_arr[2]
                },
                link: activeUrl
            },
            onComplete: function (response) {
                //TODO:: hide panel
                if ( response.text.indexOf('id="flash_error"') > 0 ){
                    //Generate event InitContent apply for Form Signin
                    after_panel.port.emit('InitContent', response.text);
                }else {
                    after_panel.port.emit('AfterSignin', response.text);
                }

                

            }
        }).post();
    });
    
    after_panel.port.on("SignOut", function(signout_url) {
        var Request = require('request').Request;
        Request({
            url: signout_url,
            onComplete: function (response) {
                PesomeInit();
            }
        }).get();
    });
    after_panel.port.on("GotoLink", function(url) {
        var tabs = require("tabs");
        tabs.open(url);
    });

    after_panel.port.on("SubmitTick", function(params_arr) {
        var Request = require('request').Request;
        Request({
            url: params_arr[0],
            content: params_arr[1],
//            content: {
//                classroom_ids: params_arr[0].toString(),
//                tags: params_arr[1],
//                title: params_arr[2]
//            },
            onComplete: function (response) {
                //TODO:: hide panel
                //after_panel.hide();
                after_panel.port.emit('AfterCreate', response.text);
            }
        }).post();
    });

    function PesomeInit(){
        
        var Request1 = require('request').Request;
        Request1({
            url: URL + '/extensions/attach_link?link='+activeUrl,
            onComplete: function (response1) {
                after_panel.port.emit('InitContent', response1.text);
            }
        }).get();
    }

};
