var url = window.location.href;

if (url.indexOf('http://dev.afterclassroom.com/robots.txt') == 0){

    var params = url.substring(url.indexOf('?'));
    self.postMessage(params);
}

