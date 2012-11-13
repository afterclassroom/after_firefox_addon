var globCode;
var originTag;
var originClassList = undefined;
var originDesc;
var loading_image = ""

//BEGIN CLASS OAUTH2===================================================================
var OAuth2 = function(adapterName, config, callback) {

    this.adapterName = adapterName;
    var that = this;
    OAuth2.loadAdapter(adapterName, function() {
        that.adapter = OAuth2.adapters[adapterName];
        if (config == OAuth2.FINISH) {
            that.finishAuth();
            return;
        } else if (config) {
            that.set('clientId', config.client_id);
            that.set('clientSecret', config.client_secret);
            that.set('apiScope', config.api_scope);
        }
    });
};
OAuth2.FINISH = 'finish';
OAuth2.adapters = {};
OAuth2.adapterReverse = localStorage.adapterReverse && JSON.parse(localStorage.adapterReverse) || {};

OAuth2.prototype.openAuthorizationCodePopup = function(callback) {
    window['oauth-callback'] = callback;
    self.port.emit('opentab', this.adapter.authorizationCodeURL(this.getConfig()));
};
OAuth2.prototype.getAccessAndRefreshTokens = function(authorizationCode, callback) {
    var that = this;

    var items = that.adapter.accessTokenParams(authorizationCode, that.getConfig());

    var myurlpost = that.adapter.accessTokenURL();

    var hopeObj = [];
    hopeObj.push(items);
    hopeObj.push(myurlpost);

    self.port.emit('callRequest', hopeObj);
};

/**
 * Extracts authorizationCode from the URL and makes a request to the last
 * leg of the OAuth 2.0 process.
*/
OAuth2.prototype.finishAuth = function() {
    var that = this;
    var authorizationCode = that.adapter.parseAuthorizationCode(window.location.href);


    //DATNT: co le doan code nay ko can thiet, chi can goi toi getAccessAndRefreshTokens
    //la ta emit Event , de main.js thuc hien AjaxCall getAccessAndRefreshTokens

    that.getAccessAndRefreshTokens(authorizationCode, function(at, rt, exp) {
        });
};

OAuth2.prototype.get = function(key) {
    return localStorage[this.adapterName + '_' + key];
};
OAuth2.prototype.set = function(key, value) {
    localStorage[this.adapterName + '_' + key] = value;
};
OAuth2.prototype.getConfig = function() {
    return {
        clientId: this.get('clientId'),
        clientSecret: this.get('clientSecret'),
        apiScope: this.get('apiScope')
    };
};
OAuth2.loadAdapter = function(adapterName, callback) {
    // If it's already loaded, don't load it again
    if (OAuth2.adapters[adapterName]) {
        callback();
        return;
    }
    callback(MyLoadAdapter());
    //BEGIN AFTERCLASSROOM ADAPTER ============================
    function MyLoadAdapter(){

        OAuth2.adapter('after', {
            authorizationCodeURL: function(config) {
                return 'http://pesome.com/oauth/authorize?response_type=code&client_id={{CLIENT_ID}}&redirect_uri={{REDIRECT_URI}}&scope={{API_SCOPE}}'
                .replace('{{CLIENT_ID}}', config.clientId)
                .replace('{{REDIRECT_URI}}', this.redirectURL(config))
                .replace('{{API_SCOPE}}', config.apiScope);
            },

            redirectURL: function(config) {
                return 'http://pesome.com/robots.txt';
            },
            parseAuthorizationCode: function(url) {
                return globCode;

            },
            accessTokenURL: function() {
                return 'http://pesome.com/oauth/token';
            },

            accessTokenMethod: function() {
                return 'POST';
            },
            accessTokenParams: function(authorizationCode, config) {
                return {
                    code: authorizationCode,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    redirect_uri: this.redirectURL(config),
                    grant_type: 'authorization_code'
                };
            },
            parseAccessToken: function(response) {
                var parsedResponse = JSON.parse(response);
                return {
                    accessToken: parsedResponse.access_token,
                    expiresIn: parsedResponse.expires_in
                };
            }
        });

    }//END FUNCTION MYLOADADAPTER
//END AFTERCLASSROOM ADAPTER ==============================
};
OAuth2.adapter = function(name, impl) {
    var implementing = 'authorizationCodeURL redirectURL accessTokenURL accessTokenMethod accessTokenParams accessToken';

    // Check for missing methods
    implementing.split(' ').forEach(function(method, index) {
        if (!method in impl) {
            throw 'Invalid adapter! Missing method: ' + method;
        }
    });
    OAuth2.adapters[name] = impl;
    OAuth2.adapterReverse[impl.redirectURL()] = name;
    localStorage.adapterReverse = JSON.stringify(OAuth2.adapterReverse);
};

OAuth2.lookupAdapterName = function(url) {
    var adapterReverse = JSON.parse(localStorage.adapterReverse);
    return adapterReverse[url];
};
OAuth2.prototype.authorize = function(callback) {
    var that = this;
    OAuth2.loadAdapter(that.adapterName, function() {
        that.adapter = OAuth2.adapters[that.adapterName];
        if (!that.get('accessToken')) {
            // There's no access token yet. Start the authorizationCode flow
            that.openAuthorizationCodePopup(callback);
        }
    });
}
OAuth2.prototype.getAccessToken = function() {
    return this.get('accessToken');
};
OAuth2.prototype.clearAccessToken = function() {
    this.clear('accessToken');
};
//END CLASS OAUTH2===================================================================

// Event initPanelEvent is from within library  of toolbarbutton
self.port.on("initPanelEvent", function(objPanel) {


    var myclient = new OAuth2('after', {
        client_id: '7c355c76ed42df0d3a33b536a7962cd6',
        client_secret: 'c29ae9f36234ed3e044e7fdfaa79a7f5',
        api_scope: 'public'
    });
    myclient.authorize(function() {});
});

self.port.on("closetab", function(myurl) {
    globCode = myurl.split("code=")[1].split('&response_type')[0];
    var finisher = new OAuth2('after', OAuth2.FINISH);
});
self.port.on("DisplayUser", function(response) {
    var objUser = jQuery.parseJSON(response);
    $('#Useravatar').attr('src','http://pesome.com'+objUser.user.image);
    $('#usr_name').text(objUser.user.name);
    $('#mypost_btn').unbind();
    $('#mypost_btn').click(function(){
        $("#mypost_btn").attr("target","_blank");
        $('#mypost_btn').attr('href','http://pesome.com/my_posts');
    });
});
self.port.on("DisplayTagList", function(response) {
    var obj = jQuery.parseJSON(response);
    var listTags = obj.list;
    originTag = $('#tagHolder').html();
    $('#tags').select2({
        tags: listTags
    });

    $('.select2-container').click(function(){
        $('#tick_to_click').hide();
    });

});

self.port.on("DisplayClassrooms", function(response) {

    var topicList = JSON.parse(response);

    var data = topicList.petopic;

    var cl_list = $('#cl_list');
    if (originClassList == undefined){
        originClassList = $('#cl_list').html();
    }
    
    $.each(data, function(i, item) {
        var st = '<li><a href="#"><label class="checkbox"><input name="classroom_ids[]" value="' +
        data[i].petopic.id + '" type="checkbox" /><span>' +
        data[i].petopic.title + '</span></label></a></li>';
        cl_list.append(st);
    });

    $('.click-ctick').unbind();
    $('.click-ctick').click(function() {
        clearTimeout(timeout);
        $("#tick_to_click").show();
    });
    var timeout;
    function hidepanel() {
        $('#tick_to_click').hide();
    }
    $('#tick_to_click').mouseleave(doTimeout);

    function doTimeout(){
        clearTimeout(timeout);
        timeout = setTimeout(hidepanel, 100);
    }

    $('#title').click(function(){
        hidepanel();
    });

});


self.port.on("ResetOnHide", function(response) {
    $('#Useravatar').attr('src','');
    $('#usr_name').text('');
    $('#cl_list').html(originClassList);
    $('#tags').before(originTag);
    $('#tagHolder').html(originTag);
    $('#btn_send').text('Send');
    $('#btn_send').attr('disabled','');
    $('#title').attr("value","");
    $('#loading_id').attr('src',loading_image);
    $('#description').html(originDesc);
});


self.port.on("UpdateLinkInfo", function(response) {


    console.log('value of response ==');
    console.log('value of response == v= ');
    console.log('value of response == v= '+response);
    //get list of classroom tick to


    var objLink = jQuery.parseJSON(response).openstruct;
    originDesc = $('#description').html();

    if (objLink != undefined){

        var strDescription = objLink.description;
        var provider = objLink.provider;
	var image = objLink.image;

        console.log('kiem tra du lieu provider :: ');
        console.log('kiem tra du lieu provider :: v = ');
        console.log('kiem tra du lieu provider :: v = '+objLink.provider);
        
        var strTmp =  "";

        console.log(' 1 ');
        console.log('len == '+strDescription.split('<iframe').length);

        if ( strDescription.split('<iframe').length == 1 ) {
            strTmp = '<span style="float: left;margin-right: 10px"><img src="' + image + '" style="height: 145px;width: 145px"></span>';
            strTmp = strTmp + strDescription;
        } else {
            strTmp = '<span style="float: left;margin-right: 10px"><img src="' + image + '" style="height: 290px;width: 290px"></span>';
        }


//	if (provider === undefined && image != undefined){
//		strDescription = '<span style="float: left;margin-right: 10px"><img src="' + image + '" style="height: 145px;width: 145px"></span>';
//	}

//        strDescription = '<span style="float: left;margin-right: 10px"><img src="' + image + '" style="height: 145px;width: 145px"></span>';

        if (objLink.title){
            $('#title').attr("value",objLink.title);
        }
        if (objLink.description){
            $('#description').html(strTmp);
        } else {
            $('#description').html('');
        }
        objLink.provider
    }


    $('#btn_send').removeAttr('disabled');

    $('#btn_send').unbind();
    $('#btn_send').click(function(){

        if ($('input[name="classroom_ids[]"]:checked').length > 0){

            var params_arr = []
            var cls_list = [];
            $('input[name="classroom_ids[]"]:checked').each(function(i){
                cls_list.push($(this).val());
            });
            var tags = $('#tags').val();
            params_arr.push(cls_list);
            params_arr.push(tags);
            if (objLink.title){
                params_arr.push(objLink.title);
            } else {
                params_arr.push("No title");
            }
            $('#btn_send').unbind();
            $('#btn_send').text('loading...');
            self.port.emit('SubmitLink', params_arr);

        }else{
            $('#alertModal').modal('show');
        }


    });
});