var pp = function(o) {
    return JSON.stringify(o,null,'  ')
};

exports.main = function(options) {
    const data = require("self").data;
    var activeUrl = "";
    var authenticationToken = undefined;
    var loadingImg = "";



    loadingImg = data.url("loading.gif");

    var after_panel = require("panel").Panel({
        width: 565,
        height: 580,
        contentURL: data.url("pages/index.html"),
        contentScriptFile: [data.url("jquery-1.7.1.min.js")
        ,data.url("firefox_oauth2.js")
        ,data.url("select2.js")
        ,data.url("bootstrap-modal.js")
        ],
        onShow: function() {
        },
        onHide: function() {
            after_panel.port.emit('ResetOnHide', null);
            activeUrl = "";
        }
    });


    var btn = require("toolbarbutton").ToolbarButton({
        id: 'my-toolbar-button',
        label: 'PeTick',
        tooltiptext: 'PeTick',
        image: data.url('img/icon_16.png'),
        panel: after_panel,
        onCommand: function() {
            //after_panel.port.emit('beginOauth', null);
            activeUrl = require("tabs").activeTab.url;
        }
    });
    if (options.loadReason === "startup") {
        btn.moveTo({
            toolbarID: "nav-bar",
            forceMove: false //only move from palette
        });
    }

    after_panel.port.on("opentab", function(url) {
        if (authenticationToken == undefined){
            var tabs = require("tabs");
            tabs.open(url);
            tabs.on('ready', function(tab) {
                tab.attach({
                    contentScriptFile: [data.url("firefox_oauth2_inject.js")],
                    onMessage: function (message) {
                        //1. Receive from firefox_oauth2_inject.js
                        //2. transfer to firefox_oauth2.js by using emit
                        tab.close();
                        after_panel.port.emit('closetab', message);
                    }
                });
            });
        }else {
            GetLinkInfo();
        }


    });

    function GetMe(){
        var Request1 = require('request').Request;
        Request1({
            url: "http://dev.afterclassroom.com/api/users/me",
            headers: {
                Authorization: 'Bearer ' + authenticationToken
            },
            onComplete: function (response1) {
                after_panel.port.emit('DisplayUser', response1.text);
                btn.showPanel();
            }
        }).get();
    }
    function GetList(){
        var Request2 = require('request').Request;
        Request2({
            url: "http://dev.afterclassroom.com/api/tags/list",
            headers: {
                Authorization: 'Bearer ' + authenticationToken
            },
            onComplete: function (response1) {
                after_panel.port.emit('DisplayTagList', response1.text);
                btn.showPanel();
            }
        }).get();
    }
    function GetClassroomImMember(){
        var Request2 = require('request').Request;
        Request2({
            url: "http://dev.afterclassroom.com/api/petopics/all_members",
            headers: {
                Authorization: 'Bearer ' + authenticationToken
            },
            onComplete: function (response1) {
                after_panel.port.emit('DisplayClassrooms', response1.text);
                btn.showPanel();
            }
        }).get();
    }
    function GetLinkInfo(){
        GetMe();
        GetList();
        GetClassroomImMember();


        var Request2 = require('request').Request;
        Request2({
            url: "http://dev.afterclassroom.com/api/peticks/attach_link",
            headers: {
                Authorization: 'Bearer ' + authenticationToken
            },
            content: {
                link: activeUrl
            },
            onComplete: function (response1) {
                var jsonResponse = JSON.parse(response1.text);

                if ( jsonResponse.error == undefined){
                    /* There's no error, Token is valid */
                    //only get other information if get link OK

                    after_panel.port.emit('UpdateLinkInfo', response1.text);
                    btn.showPanel();
                }else{
                    authenticationToken = undefined;
                    after_panel.port.emit('initPanelEvent', null);
                }
                
                
            }
        }).post();
    }


    after_panel.port.on("SubmitLink", function(params_arr) {
        var Request = require('request').Request;
        Request({
            url: "http://dev.afterclassroom.com/api/peticks",
            content: {
                title: params_arr[2],
                classroom_ids: params_arr[0].toString(),
                tags: params_arr[1],
                link: activeUrl
            },
            onComplete: function (response) {
                //TODO:: hide panel
                after_panel.hide();
            }
        }).post();
    });

    after_panel.port.on("callRequest", function(hopeObj) {
        var items = hopeObj[0];
        var myurl =  hopeObj[1];

        var Request = require('request').Request;

        Request({
            url: myurl,
            content: {
                code: items['code'].split('&')[0],
                client_id: items['client_id'],
                client_secret: items['client_secret'],
                redirect_uri: items['redirect_uri'],
                grant_type: items['grant_type']
            },
            onComplete: function (response) {
                authenticationToken = response.json.access_token;
                GetLinkInfo();
            }
        }).post();
    });
};

