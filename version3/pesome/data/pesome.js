self.port.on("InitContent", function(response) {
    console.log('re == '+response);
    $('#main_panel').html(response);
});