function show_profile() {
    $("#mytickets-tab").hide();
    $("#edit-profile").hide();
    $("#alltickets-tab").hide();
    $("#profile-tab").slideDown("normal");
    $("#li-mytickets").removeClass("active");
    $("#li-alltickets").removeClass("active");
    $("#li-profile").addClass("active");
    $(".sidebar-overlay").click();
}

function show_mytickets() {
    $("#edit-profile").hide();
    $("#profile-tab").hide();
    $("#mytickets-tab").slideDown("normal");
    $("#li-profile").removeClass("active");
    $("#li-mytickets").addClass("active");
    $(".sidebar-overlay").click();
}

function show_alltickets() {
    $("#edit-profile").hide();
    $("#profile-tab").hide();
    $("#alltickets-tab").slideDown("normal");
    $("#li-profile").removeClass("active");
    $("#li-alltickets").addClass("active");
    $(".sidebar-overlay").click();
}

function edit_profile() {
    $("#profile-tab").hide();
    $("#edit-profile").slideDown("normal");
}

function save_changes() {
    $("#edit-profile").hide();
    $("#profile-tab").slideDown("normal");
}


/*function show_deposits() {
    $("#profile-tab").hide();
    $("#edit-profile").hide();
    $("#investors-tab").hide();
    $("#deposit-tab").slideDown("normal");
    $("#li-profile").removeClass("active");
    $("#li-investors").removeClass("active");
    $("#li-deposits").addClass("active");
    $(".sidebar-overlay").click();
}*/

$(document).ready(function(e) {

    $('*').filter(function() {
        return this.id.match(/((orderbtn\-)([0-9]{1,3}))/);
    }).on('click', (function(e) {
        //orderbtn\-([0-9]{1,3})
        var order_id = $(this).attr('id').toString();
        order_id = order_id.match(/((orderbtn\-)([0-9]{1,3}))/)[3];
        //$(this).hide();
        var currency = $(this).data('currency');
        //console.log($(this).data('currency'));
        //$("#order-payment-".concat(currency).concat('-').concat(order_id)).show();
          $.ajax({
            url: '/profile/withdrawal/invest/'.concat(order_id),
            type: "GET",
            data: '',
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: function() {

            },
            error: function(data) {
                Swal.fire({
                            title: "Ошибка!",
                            text: "Возникла ошибка, обратитесь к администратору",
                            type: "error",
                        });


            },
            success: function(data) {
                    Swal.fire({
                            title: "Успех!",
                            text: "Средства перечислены на Ваш счет",
                            type: "success",
                        }).then(function () {
                                window.location.replace(location.protocol + '//' + location.host + location.pathname);
                                window.location.reload(true);
                            });
            }
        });
    }));
});

$(document).ready(function($) {
    var list = $( "a[id^='currency-bubble-']", "a[id^='currency-bubble-'] currency-circle", "a[id^='currency-bubble-'] currency-symbol" );

    //$("a[id^='currency-bubble-']")
    list.each(function(index) {
        $(this).on('click', function() {
            $("a[id^='currency-bubble-toggled-']").each(function(index, value) {
                $(this).attr('id', 'currency-bubble-'.concat($(this).attr('id').toString().replace(/currency-bubble-toggled-/, '')));
            });

            $(this).attr('id', 'currency-bubble-toggled-'.concat($(this).attr('id').toString().replace(/currency-bubble-/, '')));
        });
    });

    $('#userinfo').popover({
        container: 'body'
    });
    $('#userinfo_deposit').popover({
        container: 'body'
    });
    $('#investinfo').popover({
        container: 'body'
    });

    $('body').on('click', function(e) {
        $('[data-toggle="popover"]').each(function() {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window', container: '#deposit-tab' });
});