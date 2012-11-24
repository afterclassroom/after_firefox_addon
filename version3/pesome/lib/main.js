var pp = function(o) {
    return JSON.stringify(o,null,'  ')
};

exports.main = function(options) {
    const data = require("self").data;
    var activeUrl = "";
    var loadingImg = "";
    var URL = 'http://localhost:3000';



    loadingImg = data.url("loading.gif");

    var after_panel = require("panel").Panel({
        width: 565,
        height: 580,
        contentURL: data.url("pages/index.html"),
        contentScriptFile: [data.url("jquery-1.7.1.min.js")
        ,data.url("pesome.js")
        ,data.url("select2.js")
        ,data.url("bootstrap-modal.js")
        //        ,data.url("firefox_oauth2.js")
        
        ],
        onShow: function() {
            console.log('show again');
            console.log('show again');
            console.log('show again');
            activeUrl = require("tabs").activeTab.url;
            console.log('active URL == '+activeUrl);
            PesomeInit();
        },
        onHide: function() {
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
    
    after_panel.port.on("SubmitTick", function(params_arr) {
        var Request = require('request').Request;
        Request({
            url: params_arr[3],
            content: {
                classroom_ids: params_arr[0].toString(),
                tags: params_arr[1],
                title: params_arr[2]
            },
            onComplete: function (response) {
                //TODO:: hide panel
                after_panel.hide();
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