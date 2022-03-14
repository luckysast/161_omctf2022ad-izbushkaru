//  $(document).ready(function() {

var $table = $('#fresh-table'),
    $alertBtn = $('#alertBtn'),
    full_screen = false;

var investor_id = 0;

$().ready(function() {
    $table.bootstrapTable({
        toolbar: ".toolbar",
        searchAlign: "left",
        showRefresh: false,
        search: true,
        classes: 'table',
        showToggle: true,
        showColumns: true,
        pagination: true,
        striped: false,
        sortable: true,
        pageSize: 8,
        pageList: [8, 10, 25, 50, 100],

        formatShowingRows: function(pageFrom, pageTo, totalRows) {
            //do nothing here, we don't want to show the text "showing x of y from..."
        },
        formatRecordsPerPage: function(pageNumber) {
            return pageNumber + " rows visible";
        },
        onPostBody: function () {
            //console.log("AUE")
            investors_id = $("tbody tr[data-index]").find("td:first").each(function(e) {
                investor_id_ = $(this).text();
                console.log("investor_id_ ="+investor_id_);

                inv_selector = $(this);
                console.log($(inv_selector))
                $.ajax({
                    url: "/admin/user/" + investor_id_ + "/tickets",
                    type: "GET",
                    async: false,
                    contentType: false,
                    cache: false,
                    processData: false,
                    beforeSend: function() {

                    },
                    error: function(data) {
                        var error = data.response.errors.tickets;
                        Swal.fire("Ошибка!", error, "error");

                    },
                    success: function(data) {
                        var tickets = data.response.tickets;
                        var quantity = 0;
                        Object.keys(tickets).forEach(function(key) {
                            if (tickets[key].status === true) {
                                quantity++;
                            }
                        });
                        console.log(quantity);
                        if (quantity>0) {
                            var objectToSpawn = $('<span style="color: #aaaab1;" class="fa-stack fa-stack-3x fa-xs">'+
                            '<i class="far fa-bookmark fa-stack-2x"></i>'+
                            '<strong class="fa fa-stack-1x" style="line-height: 16px;">'+quantity+'</strong></span>');
                            console.log($(inv_selector));
                            console.log( $(inv_selector).parent().find("td:last"));
                            $(inv_selector).parent().find("td:last").append(objectToSpawn);
                        }
                    }
                });
            });
            return true;
        },
        icons: {
            refresh: 'fa fa-retweet',
            toggle: 'fa fa-th-list',
            columns: 'fa fa-columns',
            detailOpen: 'fa fa-plus-circle',
            detailClose: 'fa fa-minus-circle'
        }
    });
});


function showUserBasicInfo() {
    $.ajax({
        url: "/admin/user/" + window.investor_id + "/basicinfo",
        type: "GET",
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function() {
            //
        },
        error: function(data) {
            var error = data.response.errors.user_info;
            Swal.fire("Ошибка!", error, "error");
        },
        success: function(data) {
            //console.log(data); //обработка успеха, на выхлопе json
            var user_info = data.response.user_info;
        }
    });
}

function showUserWalletId() {
    $.ajax({
        url: "/admin/user/" + window.investor_id + "/walletinfo",
        type: "GET",
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function() {

        },
        error: function(data) {
            var error = data.response.errors.wallets; //обработка 404
            Swal.fire("Ошибка!", error, "error");

        },
        success: function(data) {
            //
            // @TODO: This hidden field used for invest manual creation!
            // Don't use it. And rework form
            //
            //console.log(data); //обработка успеха, на выхлопе json
            //var wallet_id = data.response.wallet_info.wallet_info.id;
            $("#user_id").attr('value', window.investor_id);

        }
    });
}

function showUserWalletInfo() {
    $.ajax({
        url: "/admin/user/" + window.investor_id + "/walletinfo",
        type: "GET",
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function() {

        },
        error: function(data) {
          var error = data.response.errors.wallets;
          Swal.fire("Ошибка!", error, "error");

        },
        success: function(data) {
            //console.log("VSE CHETKA")
            var i = 0;
            var invests = data.response.invests;
            var wallets = data.response.wallets;
            var ruble_wallet;
            var dollar_wallet;
            var euro_wallet;
            for (i = 0; i < wallets.length; i++) {
                if (wallets[i].ruble_wallet !== undefined){
                    ruble_wallet = wallets[i].ruble_wallet;
                } else if (wallets[i].dollar_wallet !== undefined){
                    dollar_wallet = wallets[i].dollar_wallet;
                } else if (wallets[i].euro_wallet !== undefined){
                    euro_wallet = wallets[i].euro_wallet;
                }
            }


            var objectToSpawn = $(
                '<div class="col-sm-12 col-lg-12 col-md-12 col-xs-12">'+
                    '<h2 id="user-balance">Баланс:</h2>'+
                '</div>'+
                '<div class="col-sm-12 col-lg-12 col-md-12 col-xs-12">'+
                    '<div class="col-sm-4 col-lg-4 col-md-4 col-xs-4">' +
                        '<h2 class="centerize-element">' +
                            ruble_wallet.balance + ' ₽' +
                        '</h2>' +
                    '</div>'+
                    '<div class="col-sm-4 col-lg-4 col-md-4 col-xs-4">'+
                        '<h2 class="centerize-element">' +
                            dollar_wallet.balance + ' $' +
                        '</h2>' +
                    '</div>'+
                    '<div class="col-sm-4 col-lg-4 col-md-4 col-xs-4">' +
                        '<h2 class="centerize-element">' +
                            euro_wallet.balance + ' €' +
                        '</h2>' +
                    '</div>'+
                '</div>'+
                '<div class="col-sm-12 col-lg-12 col-md-12 col-xs-4">'+
                    '<hr>' +
                '</div>'
                );
            $("#wallet-user-balance").append(objectToSpawn);

            Object.keys(invests).forEach(function(key) {
                if (invests[key].is_valid) {
                    var currency = "";
                    if (invests[key].currency === "ruble") {
                        currency = " ₽";
                    } else if (invests[key].currency === "dollar") {
                        currency = " $";
                    } else if (invests[key].currency === "euro") {
                        currency = " €";
                    }
                    var status = invests[key].status ? '<span class="invest-active">Открыт</span>' : '<span class="invest-inactive">Закрыт</span>';
                    var objectToSpawn = $('<div class="card-invest">' +
                            '<div id="invest-id-' + invests[key].id + '" class="box">'+
                              '<h2>Вклад №' + invests[key].id + '<br>' + status + '</h2>'+
                              '<hr>' +
                              '<div class="inv-info">' +
                                '<div class="inv-span"id="">Размер вклада:</div>'+
                                '<div>' + invests[key].balance + currency + '</div>'+
                              '</div>'+
                              '<div class="inv-info">'+
                                '<div class="inv-span" id="">Годовая ставка:</div>'+
                                '<div>' + (~~(invests[key].percent_per_year)) + ' % </div>'+
                              '</div>'+
                              '<div class="inv-info">'+
                                '<div class="inv-span"id="">Текущий размер выплаты:</div>'+
                                '<div>' + invests[key].balance_to_pay + currency +'</div>'+
                              '</div>'+
                              '<div class="inv-info">'+
                                '<div class="inv-span" id="">Дата окончания:</div>'+
                                '<div>' + new Date(invests[key].end_date*1000).toLocaleString() + '</div>'+
                              '</div>'+
                                '<hr class="hr-margin-10">'+
                                '<span>'+
                                  '<ul>'+
                                    '<li><a id="edit-invest-' + invests[key].id + '" data-placement="bottom" data-toggle="popover" data-trigger="hover" data-html=true title="" data-content="Изменить процент по вкладу" href="#"><i class="fa fa-edit" aria-hidden="true"></i></a></li>'+
                                    '<li><a data-placement="bottom" data-toggle="popover" data-trigger="hover" data-html=true title="" data-content="Закрыть вклад (в разработке)" href="#"><i class="fa fa-ban" aria-hidden="true"></i></a></li>'+
                                  '</ul>'+
                                '</span>'+
                            '</div>'+
                            '<div style="display:none;" id="edit-invest-form-' + invests[key].id + '" class="box">'+
                              '<h2>Вклад №' + invests[key].id + '<br>' + status + '</h2>'+
                              '<hr>'+
                              '<form id="edit-invest-percent-form-' + invests[key].id + '" name="edit-invest-percent-form" method="post" action="/profile/edit-invest-percent">'+
                                '<div class="form-group">'+
                                  '<input id="invest_id" name="invest_id" required="" type="hidden" value="' + invests[key].id + '">'+
                                  '<label for="percent_per_year" class="control-label">Процент по вкладу:</label>'+
                                  '<input class="form-control floating" id="percent_per_year" required="" name="percent_per_year" placeholder="" type="number" value="20">'+
                                '</div>'+
                                '<div class="col-sm-12 col-lg-12 col-md-12">'+
                                  '<hr>'+
                                '</div>'+
                                '<div class="col-sm-12 col-lg-12 col-md-12" style="margin-bottom: 20px;">'+
                                    '<div class="col-sm-6 col-lg-6 col-md-6">'+
                                        '<button type="button" id="' + invests[key].id + '" class="invest_go_back btn btn-bunker"><i class="fa fa-arrow-left"></i> Назад</button>'+
                                    '</div>'+
                                    '<div class="col-sm-6 col-lg-6 col-md-6">'+
                                        '<button type="submit" class="btn btn-success">Сохранить</button>'+
                                    '</div>'+
                                '</div>'+
                              '</form>'+
                            '</div>'+
                          '</div>');
                    $("#wallet-user-invests").append(objectToSpawn);
                }
                //console.log(key, invests[key]);
            });

            $(function() {
                $('[data-toggle="popover"]').popover();
                $(".invest_go_back").on('click', (function(e) {
                    $("#edit-invest-form-".concat($(this).attr('id'))).hide();
                    $("#invest-id-".concat($(this).attr('id'))).show();
                }));

                $("form[id*=edit-invest-percent-form").bind('submit', function(e) {//$("#edit-invest-percent-form")
                    var formData = {};

                    $(this).find("input, textarea, option:selected").each(function(e) {
                        var fieldData = $(this).val();
                        var fieldID = $(this).attr('id');

                        if ($(this).is(':checkbox')) {
                            fieldData = $(this).is(":checked");
                        } else if ($(this).is(':radio')) {
                            fieldData = $(this).val() + ' = ' + $(this).is(":checked");
                        } else if ($(this).is('option:selected')) {
                            fieldID = $(this).parent().attr('id');
                        }

                        formData[fieldID] = fieldData;
                    });




                    //alert(JSON.stringify(formData));
                    $.ajax({
                        type: "POST",
                        url: $(this).attr('action'), // user form action url
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(formData),
                        processData: false,
                        cache: false,
                        error: function(t) {
                            //var error = data.responseJSON.response.errors.tickets;
                            Swal.fire("Ошибка!", "Вы ввели неверные данные!", "error");
                        },
                        success: function(g) {
                            var message = data.response.message;
                            Swal.fire("Успех!", message , "success");
                            //alert('ALL OK !!!!!!!!');
                            // draw that all ok and close edit form by simulatin invest_go_back onclick event
                            //console.log(result);
                        }
                    });
                    e.preventDefault();
                    return false;
                });
            });

            $('*').filter(function() {
                return this.id.match(/((edit\-invest\-)([0-9]{1,3}))/);
            }).on('click', (function(e) {
                //orderbtn\-([0-9]{1,3})
                var invest_id = $(this).attr('id').toString();
                invest_id = invest_id.match(/((edit\-invest\-)([0-9]{1,3}))/)[3];
                //$(this).hide();
                $("#invest-id-".concat(invest_id)).hide();
                $("#edit-invest-form-".concat(invest_id)).show();
            }));
        }
    });
}


function showUserHistory() {
    $.ajax({
        url: "/admin/user/" + window.investor_id + "/tickets",
        type: "GET",
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function() {

        },
        error: function(data) {
            var error = data.response.errors.tickets;
            Swal.fire("Ошибка!", error, "error");

        },
        success: function(data) {
            var tickets = data.response.tickets;

            Object.keys(tickets).forEach(function(key) {
                if (tickets[key].status === false) {
                    var currency = "";
                    if (tickets[key].currency === "ruble") {
                        currency = " ₽";
                    } else if (tickets[key].currency === "dollar") {
                        currency = " $";
                    } else if (tickets[key].currency === "euro") {
                        currency = " €";
                    }
                    var ticket_type = '';
                    if (tickets[key].ticket_type === 'refillwallet') {
                      ticket_type = "Пополнение баланса";
                    } else if (tickets[key].ticket_type === 'investcreation'){
                      ticket_type = "Создание вклада";
                    } else if (tickets[key].ticket_type === 'paymentrequest') {
                      ticket_type = "Вывод средств";
                    }
                    var objectToSpawn = $('<tr>'+
                        '<th scope="row">'+tickets[key].id+'</th>'+
                        '<td>'+ticket_type+'</td>'+
                        '<td>'+tickets[key].cash+currency+'</td>'+
                        '<td>'+new Date(tickets[key].create_date*1000).toLocaleString()+'</td>'+
                      '</tr>');
                    $("#user-history-table tbody").append(objectToSpawn);
                }
            });
          }
        });
  }


function showUserTickets() {
    $.ajax({
        url: "/admin/user/" + window.investor_id + "/tickets",
        type: "GET",
        contentType: false,
        cache: false,
        processData: false,
        beforeSend: function() {

        },
        error: function(data) {
            var error = data.response.errors.tickets;
            Swal.fire("Ошибка!", error, "error");
        },
        success: function(data) {
            var tickets = data.response.tickets;

            Object.keys(tickets).forEach(function(key) {

                if (tickets[key].status === true) {
                    var currency = "";
                    if (tickets[key].currency === "ruble") {
                        currency = " ₽";
                    } else if (tickets[key].currency === "dollar") {
                        currency = " $";
                    } else if (tickets[key].currency === "euro") {
                        currency = " €";
                    }
                    var ticket_type = '';
                    if (tickets[key].ticket_type === 'refillwallet') {
                      ticket_type = "Пополнение баланса";
                    } else if (tickets[key].ticket_type === 'investcreation'){
                      ticket_type = "Создание вклада";
                    } else if (tickets[key].ticket_type === 'paymentrequest') {
                      ticket_type = "Вывод средств";
                    }
                    var objectToSpawn = $('<div id="card-ticket-'+tickets[key].id+'" class="card-invest">' +
                            '<div id="ticket-id-' + tickets[key].id + '" class="box">'+
                              '<h2>Обращение №' + tickets[key].id + '</h2>'+
                              '<hr>' +

                              '<div class="inv-info">' +
                                '<div class="inv-span"id="">Тип обращения:</div>'+
                                '<div>' + ticket_type + '</div>'+
                              '</div>'+

                              '<div class="inv-info">' +
                                '<div class="inv-span"id="">Сумма:</div>'+
                                '<div>' + tickets[key].cash + currency+'</div>'+
                              '</div>'+
                                '<hr class="hr-margin-10">'+
                                '<span>'+
                                  '<ul>'+
                                    '<li><a id="approve-ticket-' + tickets[key].id + '" data-placement="bottom" data-toggle="popover" data-trigger="hover" data-html=true title="" data-content="Одобрить" href="#"><i class="fa fa-check-circle" aria-hidden="true"></i></a></li>'+
                                    '<li><a '+ 'id="decline-ticket-' + tickets[key].id + ' data-placement="bottom" data-toggle="popover" data-trigger="hover" data-html=true title="" data-content="Отклонить" href="#"><i class="fa fa-ban" aria-hidden="true"></i></a></li>'+
                                  '</ul>'+
                                '</span>'+
                            '</div>'+
                          '</div>');
                    $("#user-tickets").append(objectToSpawn);
                }
            });

            $(function() {
                $('[data-toggle="popover"]').popover();
                $(".invest_go_back").on('click', (function(e) {
                    $("#edit-invest-form-".concat($(this).attr('id'))).hide();
                    $("#invest-id-".concat($(this).attr('id'))).show();
                }));



                $("#edit-invest-percent-form").bind('submit', function(e) {
                    var formData = {};

                    $(this).find("input, textarea, option:selected").each(function(e) {
                        var fieldData = $(this).val();
                        var fieldID = $(this).attr('id');

                        if ($(this).is(':checkbox')) {
                            fieldData = $(this).is(":checked");
                        } else if ($(this).is(':radio')) {
                            fieldData = $(this).val() + ' = ' + $(this).is(":checked");
                        } else if ($(this).is('option:selected')) {
                            fieldID = $(this).parent().attr('id');
                        }

                        formData[fieldID] = fieldData;
                    });



                    //обработка запроса на изменение процента
                    //alert(JSON.stringify(formData));
                    $.ajax({
                        type: "POST",
                        url: $(this).attr('action'), // user form action url
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(formData),
                        processData: false,
                        cache: false,
                        error: function(t) {
                            // parse error from errors
                            //alert('ERRORROOROROOROORORORROOROROROOR EROK!');
                            var error = t.response.message;
                            Swal.fire({title: 'Ошибка!', text: error, type: 'error'});
                            console.log(t);
                            //alert() to user
                        },
                        success: function(g) {
                            var success = g.response.message;
                            console.log("TESTTREST");
                            Swal.fire({title: 'Готово!', text: success, type: 'success'});
                            //alert('ALL OK !!!!!!!!');
                            // draw that all ok and close edit form by simulatin invest_go_back onclick event
                            //console.log(result);
                        }
                    });
                    e.preventDefault();
                    return false;
                });
            });

            $('*').filter(function() {
                return this.id.match(/((approve\-ticket\-)([0-9]{1,3}))/);
            }).on('click', (function(e) {
                //orderbtn\-([0-9]{1,3})
                var current_object = $(this);
                var ticket_id = $(this).attr('id').toString();
                ticket_id = ticket_id.match(/((approve\-ticket\-)([0-9]{1,3}))/)[3];
                $.ajax({
                        type: "POST",
                        url: "/admin/ticket/"+ticket_id+"/approve",
                        dataType: 'json',
                        contentType: 'application/json',
                        data: {},
                        processData: false,
                        cache: false,
                        error: function(t) {
                            // parse error from errors
                            //alert('ERRORROOROROOROORORORROOROROROOR EROK!');
                            Swal.fire("Ошибка", "Произошла ошибка при выполнении операции!", "error");
                            console.log("error in ticket approvement");
                            //alert() to user
                            //current_object.parents()[5].remove();
                        },
                        success: function(g) {
                            var success = g.response.message;
                            $("#card-ticket-".concat(ticket_id)).remove();
                            Swal.fire("Готово!", success, "success");
                            console.log("ticket approvement successed");

                            //alert('ALL OK !!!!!!!!');
                            // draw that all ok and close edit form by simulatin invest_go_back onclick event
                            //console.log(result);

                        }
                    });
            }));

            $('*').filter(function() {
                return this.id.match(/((decline\-ticket\-)([0-9]{1,3}))/);
            }).on('click', (function(e) {
                //orderbtn\-([0-9]{1,3})
                var current_object = $(this);
                var ticket_id = $(this).attr('id').toString();
                ticket_id = ticket_id.match(/((decline\-ticket\-)([0-9]{1,3}))/)[3];
                $.ajax({
                        type: "POST",
                        url: "/admin/ticket/"+ticket_id+"/decline",
                        dataType: 'json',
                        contentType: 'application/json',
                        data: {},
                        processData: false,
                        cache: false,
                        error: function(t) {
                            // parse error from errors
                            //alert('ERRORROOROROOROORORORROOROROROOR EROK!');
                            Swal.fire("Ошибка", "Произошла ошибка при выполнении операции!", "error");
                            console.log("error in ticket declinement:"+t);
                            //alert() to user
                            //current_object.parents()[5].remove();
                        },
                        success: function(g) {
                            var success = data.response.message;
                            Swal.fire({title:'Готово!', text: success, type: 'success', timer: 3000});
                            console.log("ticket declinement successed");

                            //alert('ALL OK !!!!!!!!');
                            // draw that all ok and close edit form by simulatin invest_go_back onclick event
                            //console.log(result);
                            $("#card-ticket-".concat(ticket_id)).remove();
                        }
                    });
            }));

            $('*').filter(function() {
                return this.id.match(/((edit\-invest\-)([0-9]{1,3}))/);
            }).on('click', (function(e) {
                //orderbtn\-([0-9]{1,3})
                var invest_id = $(this).attr('id').toString();
                invest_id = invest_id.match(/((edit\-invest\-)([0-9]{1,3}))/)[3];
                //$(this).hide();
                $("#invest-id-".concat(invest_id)).hide();
                $("#edit-invest-form-".concat(invest_id)).show();
            }));
        }
    });
}


/*

        response = getUserWalletInfo()
        console.log(response)
        balance = response.response.walletinfo.wallet_info.balance;
            var respObject = $('<label>Баланс: ' + balance + '</label>');
            $("#wallet").append(respObject);
            */


$(function getInvestorId() {
    //$("tbody tr[data-index]").click(function() {
    $("tbody tr[data-index]").find(".edit").on( "click", function() {
      //console.log($(this));
       var batya = $(this).parent("td").parent("tr");
       //console.log(batya)
       //var batya = $(this)
        if (window.investor_id === 0) {
            $("#user-not-selected").addClass("disp-none");
            $("#tab-content-id").removeClass("disp-none");
        }
        //$(this).find("td:first").text(); // here investor id selected
        window.investor_id = parseInt(batya.find("td:first").text(), 10);
        //console.log("invid="+window.investor_id);

        $("#selected-investor").removeClass("selected-investor");
        $("#selected-investor").attr('id', ' ');

        batya.addClass("selected-investor");
        batya.attr('id', 'selected-investor');
        $("#wallet-user-balance").empty();
        $("#wallet-user-invests").empty();
        $("#user-tickets").empty();
        $("#user-history-table tbody").empty();

        //если активна вкладка wallet
        if ($("#nav-ul").find("li.active").find("a").attr("href") == "#wallet") {
            showUserWalletInfo();
        }

        //если активна вкладка requests
        if ($("#nav-ul").find("li.active").find("a").attr("href") == "#requests") {
            showUserTickets();
        }

        //если активна вкладка history
        if ($("#nav-ul").find("li.active").find("a").attr("href") == "#history") {
            showUserHistory();
            //showUserWalletInfo();
        }

        //если активна вкладка create-invest
        if ($("#nav-ul").find("li.active").find("a").attr("href")=="#create-invest")
        {
          showUserWalletId();

        }



        return window.investor_id;
    });
});

$(function() {
    $(".nav-tabs a").click(function() {
        $(this).tab('show');
        $("tbody tr[data-index]#selected-investor").find(".edit").click();
    });
});


$(function() {
    $alertBtn.click(function() {
        alert("You pressed on Alert");
    });
});

window.operateEvents = {
    'click .edit': function(e, value, row, index) {
        console.log(value, row, index);
    },
    'click .remove': function(e, value, row, index) {
        //alert('You click remove icon, row: ' + JSON.stringify(row));
        //console.log(value, row, index);
    }
};

function operateFormatter(value, row, index) {
    return [
        '<a rel="tooltip" title="Edit" class="table-action edit" href="javascript:void(0)" title="Edit">',
        '<i class="fa fa-edit"></i>',
        '</a>',
        '<!--<a rel="tooltip" title="Remove" class="table-action remove" href="javascript:void(0)" title="Remove">',
        '<i class="fa fa-ban"></i>',
        '</a>-->'
    ].join('');
}


//});
//