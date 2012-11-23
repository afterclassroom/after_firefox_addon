self.port.on("InitContent", function(response) {
    $('#main_panel').html(response);
    $('#main_panel').css('display','');
});