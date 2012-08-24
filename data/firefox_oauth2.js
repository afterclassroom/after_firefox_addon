var globCode;
var originClassList;
var originTag;
var loading_image = ""
var originDesc;

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
/**
 * Pass instead of config to specify the finishing OAuth flow.
 */
OAuth2.FINISH = 'finish';
/**
 * OAuth 2.0 endpoint adapters known to the library
 */
OAuth2.adapters = {};
OAuth2.adapterReverse = localStorage.adapterReverse && JSON.parse(localStorage.adapterReverse) || {};

/**
 * Opens up an authorization popup window. This starts the OAuth 2.0 flow.
 *
 * @param {Function} callback Method to call when the user finished auth.
 */

OAuth2.prototype.openAuthorizationCodePopup = function(callback) {

    // Store a reference to the callback so that the newly opened window can call
    // it later.
    window['oauth-callback'] = callback;

    // Create a new tab with the OAuth 2.0 prompt

    self.port.emit('opentab', this.adapter.authorizationCodeURL(this.getConfig()));

//function(tab) {
// 1. user grants permission for the application to access the OAuth 2.0
// endpoint
// 2. the endpoint redirects to the redirect URL.
// 3. the extension injects a script into that redirect URL
// 4. the injected script redirects back to oauth2.html, also passing
// the redirect URL
// 5. oauth2.html uses redirect URL to know what OAuth 2.0 flow to finish
// (if there are multiple OAuth 2.0 adapters)
// 6. Finally, the flow is finished and client code can call
// myAuth.getAccessToken() to get a valid access token.
//});
};
/**
 * Gets access and refresh (if provided by endpoint) tokens
 *
 * @param {String} authorizationCode Retrieved from the first step in the process
 * @param {Function} callback Called back with 3 params:
 *                            access token, refresh token and expiry time
 */
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
        /* DATNT: BEGIN COMMENT
         * DatNT: the following code is no longer needed for FIREFOX
        that.set('accessToken', at);
        that.set('expiresIn', exp);
        // Most OAuth 2.0 providers don't have a refresh token
        if (rt) {
            that.set('refreshToken', rt);
        }
        that.set('accessTokenDate', (new Date()).valueOf());

        // Loop through existing extension views and excute any stored callbacks.
        var views = chrome.extension.getViews();
        for (var i = 0, view; view = views[i]; i++) {
            if (view['oauth-callback']) {
                view['oauth-callback']();
            // TODO: Decide whether it's worth it to scope the callback or not.
            // Currently, every provider will share the same callback address, but
            // that's not such a big deal assuming that they check to see whether
            // the token exists instead of blindly trusting that it does.
            }
        };

        // Once we get here, close the current tab and we're good to go.
        // The following works around bug: crbug.com/84201
        window.open('', '_self', '');
        window.close();
         DATNT: END COMMENT
         **/


        });
};


/**
 * Wrapper around the localStorage object that gets variables prefixed
 * by the adapter name
 *
 * @param {String} key The key to use for lookup
 * @return {String} The value
 */
OAuth2.prototype.get = function(key) {
    return localStorage[this.adapterName + '_' + key];
};

/**
 * Wrapper around the localStorage object that sets variables prefixed
 * by the adapter name
 *
 * @param {String} key The key to store with
 * @param {String} value The value to store
 */
OAuth2.prototype.set = function(key, value) {
    localStorage[this.adapterName + '_' + key] = value;
};

/**
 * The configuration parameters that are passed to the adapter
 *
 * @returns {Object} Containing clientId, clientSecret and apiScope
 */
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
            /**
   * @return {URL} URL to the page that returns the authorization code
   */
            authorizationCodeURL: function(config) {
                return 'http://dev.afterclassroom.com/oauth/authorize?response_type=code&client_id={{CLIENT_ID}}&redirect_uri={{REDIRECT_URI}}&scope={{API_SCOPE}}'
                .replace('{{CLIENT_ID}}', config.clientId)
                .replace('{{REDIRECT_URI}}', this.redirectURL(config))
                .replace('{{API_SCOPE}}', config.apiScope);
            },

            /**
   * @return {URL} URL to the page that we use to inject the content
   * script into
   */
            redirectURL: function(config) {
                return 'http://dev.afterclassroom.com/robots.txt';
            },

            /**
   * @return {String} Authorization code for fetching the access token
   */
            parseAuthorizationCode: function(url) {
                //BEGIN DatNT comment
                //    var error = url.match(/\?error=(.+)/);
                //    if (error) {
                //      throw 'Error getting authorization code: ' + error[1];
                //    }
                //    return url.match(/\?code=([\w\/\-]+)/)[1];
                //END DatNT comment
                return globCode;

            },

            /**
   * @return {URL} URL to the access token providing endpoint
   */
            accessTokenURL: function() {
                return 'http://dev.afterclassroom.com/oauth/token';
            },

            /**
   * @return {String} HTTP method to use to get access tokens
   */
            accessTokenMethod: function() {
                return 'POST';
            },

            /**
   * @return {Object} The payload to use when getting the access token
   */
            accessTokenParams: function(authorizationCode, config) {
                return {
                    code: authorizationCode,
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    redirect_uri: this.redirectURL(config),
                    grant_type: 'authorization_code'
                };
            },

            /**
   * @return {Object} Object containing accessToken {String},
   * refreshToken {String} and expiresIn {Int}
   */
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

/**
 * Registers an adapter with the library. This call is used by each adapter
 *
 * @param {String} name The adapter name
 * @param {Object} impl The adapter implementation
 *
 * @throws {String} If the specified adapter is invalid
 */
OAuth2.adapter = function(name, impl) {
    var implementing = 'authorizationCodeURL redirectURL accessTokenURL accessTokenMethod accessTokenParams accessToken';

    // Check for missing methods
    implementing.split(' ').forEach(function(method, index) {
        if (!method in impl) {
            throw 'Invalid adapter! Missing method: ' + method;
        }
    });

    // Save the adapter in the adapter registry
    OAuth2.adapters[name] = impl;
    // Make an entry in the adapter lookup table
    OAuth2.adapterReverse[impl.redirectURL()] = name;
    // Store the the adapter lookup table in localStorage
    localStorage.adapterReverse = JSON.stringify(OAuth2.adapterReverse);
};

/**
 * Looks up the adapter name based on the redirect URL. Used by oauth2.html
 * in the second part of the OAuth 2.0 flow.
 *
 * @param {String} url The url that called oauth2.html
 * @return The adapter for the current page
 */
OAuth2.lookupAdapterName = function(url) {
    var adapterReverse = JSON.parse(localStorage.adapterReverse);
    return adapterReverse[url];
};
/***********************************
 *
 * PUBLIC API
 *
 ***********************************/
/**
 * Authorizes the OAuth authenticator instance.
 *
 * @param {Function} callback Tries to callback when auth is successful
 *                            Note: does not callback if grant popup required
 */
OAuth2.prototype.authorize = function(callback) {
    var that = this;
    OAuth2.loadAdapter(that.adapterName, function() {
        that.adapter = OAuth2.adapters[that.adapterName];
        if (!that.get('accessToken')) {
            // There's no access token yet. Start the authorizationCode flow
            that.openAuthorizationCodePopup(callback);
        } else if (that.isAccessTokenExpired()) {
            // There's an existing access token but it's expired
            if (that.get('refreshToken')) {
                that.refreshAccessToken(that.get('refreshToken'), function(at, exp) {
                    that.set('accessToken', at);
                    that.set('expiresIn', exp);
                    that.set('accessTokenDate', (new Date()).valueOf());
                    // Callback when we finish refreshing
                    if (callback) {
                        callback();
                    }
                });
            } else {
                // No refresh token... just do the popup thing again
                that.openAuthorizationCodePopup(callback);
            }
        } else {
            // We have an access token, and it's not expired yet
            if (callback) {
                callback();
            }
        }
    });
}
/**
 * @returns A valid access token.
 */
OAuth2.prototype.getAccessToken = function() {
    return this.get('accessToken');
};

/**
 * Clears an access token, effectively "logging out" of the service.
 */
OAuth2.prototype.clearAccessToken = function() {
    this.clear('accessToken');
};



//END CLASS OAUTH2===================================================================

// Event initPanelEvent is from within library  of toolbarbutton
self.port.on("initPanelEvent", function(objPanel) {


    var myclient = new OAuth2('after', {
        client_id: 'c7c97349e6ef49912d87fb762023c3b2958fc6f559f73927b3cd0262dd1c8bd5',
        client_secret: 'd8ce0fc0ba134424d8aa6c73d19637c0e5a61a59364849eab1e93d9c811b9ebb',
        api_scope: 'public'
    });
    myclient.authorize(function() {});
});

self.port.on("closetab", function(myurl) {
    globCode = myurl.split("code=")[1];
    var finisher = new OAuth2('after', OAuth2.FINISH);
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
self.port.on("UpdateLinkInfo", function(response) {
    //get list of classroom tick to
    

    var objLink = jQuery.parseJSON(response).openstruct;
    originDesc = $('#description').html();
    if (objLink != undefined){
        if (objLink.title){
            $('#title').attr("value",objLink.title);
        }
        if (objLink.description){
            $('#description').html(objLink.description);
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

self.port.on("DisplayUser", function(response) {
    var objUser = jQuery.parseJSON(response);
    $('#Useravatar').attr('src','http://dev.afterclassroom.com'+objUser.user.image);
    $('#usr_name').text(objUser.user.name);
});

self.port.on("DisplayClassrooms", function(response) {

    var data = eval(response);

    var cl_list = $('#cl_list');
    originClassList = $('#cl_list').html();
    $.each(data, function(i, item) {
        var st = '<li><a href="#"><label class="checkbox"><input name="classroom_ids[]" value="' +
        data[i].classroom.id + '" type="checkbox" /><span>' +
        data[i].classroom.title + '</span></label></a></li>';
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