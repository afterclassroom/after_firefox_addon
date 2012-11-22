self.port.on("InitContent", function(response) {
    console.log('re == '+response);
    $('#container').html(response);
});