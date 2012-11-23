var pp = function(o) {
    return JSON.stringify(o,null,'  ')
};

exports.main = function(options) {
    const data = require("self").data;
    var activeUrl = "";
    var authenticationToken = undefined;
    var loadingImg = "";
    var URL = 'http://localhost:3000';



    loadingImg = data.url("loading.gif");

    var after_panel = require("panel").Panel({
        width: 565,
        height: 580,
        contentURL: data.url("pages/index.html"),
        contentScriptFile: [data.url("jquery-1.7.1.min.js")
        ,data.url("pesome.js")
        //        ,data.url("firefox_oauth2.js")
        //        ,data.url("select2.js")
        //        ,data.url("bootstrap-modal.js")
        ],
        onShow: function() {
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
        console.log('begin to submit sign in');
        console.log('action la == '+params_arr[0]);
        console.log('name == '+params_arr[1]);
        console.log('word == '+params_arr[2]);
        var Request = require('request').Request;

//        Request({
//            url: params_arr[0],
//            content: {
//            },
//            onComplete: function (response) {
//                //TODO:: hide panel
//                alert('submit xong')
//            }
//        }).post();
    });
    
    function PesomeInit(){
        var Request1 = require('request').Request;
        Request1({
            url: URL + '/extensions/attach_link',
            onComplete: function (response1) {
                after_panel.port.emit('InitContent', response1.text);
            }
        }).get();
    }

};