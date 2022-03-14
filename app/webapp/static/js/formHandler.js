var counter = 0;
var formID = '';

var curLink = window.location.href;
// add
//order-payment-
// ((#wallet+$)|(#+(order-payment|make-invest|request-payment|refill-wallet)-((dollar|ruble|euro)|(-+[0-9]{1,2}))+$))
//
//
var reg = curLink.match(/((#wallet+$)|(#+(make-invest|request-payment|refill-wallet)-(dollar|ruble|euro)+$)|(#+(order-payment)-(dollar|ruble|euro)-([0-9]{1,2})))/);

if (reg !== undefined && reg !== null) {
    var currency = '';
    var formTarget = '';

    if (reg[8] !== undefined) {
        currency = reg[8];
    } else if (reg[5] !== undefined) {
        currency = reg[5];
    }
    if (reg[0] !== undefined) {
        formTarget = reg[0];
    }

    show_wallet();
    if (currency == "euro") {
        $("#currency-bubble-3").click();
    } else if (currency == "dollar") {
        $("#currency-bubble-2").click();
    } else if (currency == "ruble") {
        $("#currency-bubble-1").click();
    }

    setTimeout(function() {
        $("form[id^='make-invest-'],form[id^='request-payment-'],form[id^='refill-wallet-'],form[id^='order-payment-euro-'],form[id^='order-payment-ruble-'],form[id^='order-payment-dollar-']").each(function(index) {
            if ('#'.concat($(this).attr('id').toString()) === formTarget) {
                $('html, body').animate({
                    scrollTop: $(this).offset().top,
                    duration: 100
                }, 1000);
            }
        });
    }, 1000);
}

function getFieldTitle(field_name) {
    fields = [{
        "phone_number": "телефон",
        "last_name": "фамилия",
        "first_name": "имя",
        "middle_name": "отчество",
        "cash": "сумма для пополнения",
        "email": "email"
    }];
    return fields[0][field_name];

}

function kek(jsonData) {
    var cool = [];
    for (var i in jsonData) {
        var key = i;
        var val = jsonData[i];
        for (var j in val) {
            var sub_key = j;
            var sub_val = val[j];
            cool.push(sub_key);
        }
    }
    return cool;
}







$(document).ready(function(e) {

    $('body').ajaxComplete(function (e, xhr, settings) {
    if (xhr.status == 200) {
        var redirect = null;
        try {
            redirect = $.parseJSON(xhr.responseText).redirect;
            if (redirect) {
                window.location.href = redirect;
            }
        } catch (e) {
            return;
        }
    }
});

    //function destroyCroppie() { $uploadCrop.croppie('destroy'); }


    //function resetCroppie() { destroyCroppie(); }

    var $uploadCrop,
        tempFilename,
        rawImg,
        imageId;

    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('.upload-image').addClass('ready');
                $('#cropImagePop').modal('show');
                rawImg = e.target.result;
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            swal("Sorry - you're browser doesn't support the FileReader API");
        }
    }

    $uploadCrop = $('#upload-image').croppie({
        minZoom: 1,
        maxZoom: 3,
        viewport: {
            width: 200,
            height: 200,
            type: 'square'
        },
        boundary: {
            height: 500
        },
        enforceBoundary: true,
        enableExif: false
    });
    $('#cropImagePop').on('shown.bs.modal', function() {
        // alert('Shown pop');
        $uploadCrop.croppie('bind', {
            url: rawImg
        }).then(function() {
            $uploadCrop.croppie('setZoom', 1);
            console.log('jQuery bind complete');
        });
    });

    $('#image').on('change', function() {
        //resetCroppie();
        imageId = $(this).data('id');
        tempFilename = $(this).val();
        $('#cancelCropBtn').data('id', imageId);
        readFile(this);
    });
    $('#cropImageBtn').on('click', function(ev) {
        $(".cr-image").attr('crossorigin', 'anonymous');
        $uploadCrop.croppie('result', {
            type: 'blob',
            format: 'jpeg',
            size: { width: 150, height: 200 }
        }).then(function(resp) {
            var fData = new FormData()
            var file = new File([resp], 'image.jpg', {type: 'image/jpeg', lastModified: Date.now()});
            fData.append('image',file);
            $.ajax({
            url: '/uploadavatar',
            type: "POST",
            data: fData,
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: function() {

            },
            error: function(data) {

            },
            success: function(data) {
                var new_avatar = data.response.new_avatar;
                $(".profile-img-wrap img").attr('src', new_avatar);
                //$("#edit-profile #avatar").val(new_avatar);
            }
        });
            //$('.profile-img-wrap').attr('src', resp);
            $('#cropImagePop').modal('hide');
        });
    });
    // End upload preview image




    $("#uploadavatar").on('submit', (function(e) {
        e.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            type: "POST",
            data: new FormData(this),
            contentType: false,
            cache: false,
            processData: false,
            beforeSend: function() {

            },
            error: function(data) {

            },
            success: function(data) {
                var new_avatar = data.response.new_avatar;
                $(".profile-img-wrap img").attr('src', new_avatar);
                $("#edit-profile #avatar").val(new_avatar);
            }
        });
    }));


    /*$("#image").on('change', function() {
        $("#uploadavatar").submit();
    });*/

    $("input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitSuccess: function($form, event) {
            if ((!($form.attr('name')==='reset_password_name') &&!($form.attr('name') == "uploadavatar"))) {
                event.preventDefault();
                formID = $form.attr('id');
                var actionurl = $form.attr('action');

                var formData = {};

                $form.find("input, textarea, option:selected").each(function(e) {
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

                $.ajax({
                    url: actionurl,
                    type: "POST",
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(formData),
                    processData: false,
                    //complete: onRequestCompleted,
                    cache: false,
                    success: function(e) {
                        Swal.fire({
                            title: "Успех!",
                            text: ($form.attr('name')==='forgot_password_name') ? 'Запрос на сброс пароля осуществлен. Инструкции по восстановлению пароля были высланы на указанный email.' : e.response.message,
                            type: "success",
                        }).then((result) => {
                            /*
                            Complete logic. We should get currenct href as the base
                             */
                            if (formID !== undefined) {
                                if (formID === "login_form") {
                                    window.location.href = (location.protocol + '//' + location.host + '/profile');
                                } else {
                                    window.location.replace(location.protocol + '//' + location.host + location.pathname.concat("#").concat(formID));
                                    window.location.reload(true);
                                                            }
                            } else {
                                window.location.replace(location.protocol + '//' + location.host + location.pathname);
                                window.location.reload(true);
                            }
                        });
                    },
                    error: function(e) {
                        try {
                            grecaptcha.reset();
                        } catch (err) {
                            console.log('egor');
                        }
                        show_incorrect_msg_box();

                        if (e.responseJSON !== undefined) {
                            console.log(e.responseJSON.response.errors);
                            if (formID === "login_form" || formID === "register_form") {
                                if (e.responseJSON.response.errors.login !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.login.length; i++) {
                                        incorrect(e.responseJSON.response.errors.login[i]);
                                        //console.log("entrypoint login");
                                        $("#login").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#login").removeClass("highligh-incorr-input"); }, 5000);
                                    }
                                }
                                if (e.responseJSON.response.errors.email !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.email.length; i++) {
                                        incorrect(e.responseJSON.response.errors.email[i]);
                                        //console.log("entrypoint email");
                                        $("#email").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#email").removeClass("highligh-incorr-input"); }, 5000);
                                    }
                                }
                                if (e.responseJSON.response.errors.phone_number !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.phone_number.length; i++) {
                                        incorrect(e.responseJSON.response.errors.phone_number[i]);
                                        //console.log("entrypoint phonenumber");
                                        $("#phone_number").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#phone_number").removeClass("highligh-incorr-input"); }, 5000);
                                    }
                                }
                                if (e.responseJSON.response.errors.password !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.password.length; i++) {
                                        incorrect(e.responseJSON.response.errors.password[i]);
                                        //console.log("entrypoint password");
                                        $("#password").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#password").removeClass("highligh-incorr-input"); }, 3000);

                                    }
                                }
                                if (e.responseJSON.response.errors.company_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.company_name.length; i++) {
                                        incorrect(e.responseJSON.response.errors.company_name[i]);
                                        //console.log("entrypoint password");
                                        $("#company_name").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#company_name").removeClass("highligh-incorr-input"); }, 3000);

                                    }
                                }

                                if (e.responseJSON.response.errors.last_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.last_name.length; i++) {
                                        incorrect(e.responseJSON.response.errors.last_name[i]);
                                        //console.log("entrypoint password");
                                        $("#last_name").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#last_name").removeClass("highligh-incorr-input"); }, 3000);

                                    }
                                }
                                if (e.responseJSON.response.errors.middle_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.middle_name.length; i++) {
                                        incorrect(e.responseJSON.response.errors.middle_name[i]);
                                        //console.log("entrypoint password");
                                        $("#middle_name").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#middle_name").removeClass("highligh-incorr-input"); }, 3000);

                                    }
                                }
                                if (e.responseJSON.response.errors.first_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.first_name.length; i++) {
                                        incorrect(e.responseJSON.response.errors.first_name[i]);
                                        //console.log("entrypoint password");
                                        $("#first_name").addClass("highligh-incorr-input");
                                        setTimeout(function() { $("#first_name").removeClass("highligh-incorr-input"); }, 3000);

                                    }
                                }
                                if (e.responseJSON.response.errors.recaptcha !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.recaptcha.length; i++) {
                                        incorrect(e.responseJSON.response.errors.recaptcha[i]);
                                        //console.log("entrypoint password");
                                        $(".g-recaptcha").addClass("highligh-incorr-input");
                                        setTimeout(function() { $(".g-recaptcha").removeClass("highligh-incorr-input"); }, 3000);

                                    }
                                }
                            } else {
                                console.log("entry point");

                                var errors = [];

                                
                                if (e.responseJSON.response.errors.first_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.first_name.length; i++) {
                                        errors.push(e.responseJSON.response.errors.first_name[i]);
                                    }
                                }
                                if (e.responseJSON.response.errors.middle_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.middle_name.length; i++) {
                                        errors.push(e.responseJSON.response.errors.middle_name[i]);

                                    }
                                }
                                if (e.responseJSON.response.errors.phone_number !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.phone_number.length; i++) {
                                        errors.push(e.responseJSON.response.errors.phone_number[i]);
                                    }
                                }
                                if (e.responseJSON.response.errors.last_name !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.last_name.length; i++) {
                                        errors.push(e.responseJSON.response.errors.last_name[i]);

                                    }
                                }
                                if (e.responseJSON.response.errors.email !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.email.length; i++) {
                                        errors.push(e.responseJSON.response.errors.email[i]);
                                    }
                                }
                                if (e.responseJSON.response.errors.login !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.login.length; i++) {
                                        errors.push(e.responseJSON.response.errors.login[i]);
                                    }
                                }
                                if (e.responseJSON.response.errors.password !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.password.length; i++) {
                                        errors.push(e.responseJSON.response.errors.password[i]);

                                    }
                                }
                                if (e.responseJSON.response.errors.cash !== undefined) {
                                    var i = 0;
                                    for (i = 0; i < e.responseJSON.response.errors.cash.length; i++) {
                                        errors.push(e.responseJSON.response.errors.cash[i]);
                                    }
                                }
                                

                                console.log();
                                var error_category = kek(e.responseJSON.response);
                                console.log(error_category);
                                var progresssteps = [];
                                var queuelist = [];
                                var i = 0;
                                for (i = 0; i < error_category.length; i++) {
                                    progresssteps.push((i + 1).toString());
                                    queuelist.push({
                                        title: 'Ошибка',
                                        html: "Ошибка в поле: <b>" + getFieldTitle(error_category[i]) + '</b><br>' + errors[i],
                                        //text: errors[i],
                                    });
                                }
                                console.log(errors);

                                /*[ {

                                } , {

                                }]   */

                                Swal.mixin({
                                    type: 'error',
                                    //title: "Ошибка!",
                                    //input: 'text',
                                    confirmButtonText: 'Понятно &rarr;',
                                    //showCancelButton: true,
                                    //cancelButtonText: 'Отмена',
                                    progressSteps: progresssteps
                                }).queue(queuelist);
                                /*.then((result) => {
                                                                    if (result.value) {
                                                                        Swal.fire({

                                                                            title: 'All done!',
                                                                            html: 'Your answers: <pre><code>' +
                                                                                JSON.stringify(result.value) +
                                                                                '</code></pre>',
                                                                            confirmButtonText: 'Lovely!'
                                                                        })
                                                                    }
                                                                });*/

                            }
                        }
                    },
                });
            }
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });



    function show_incorrect_msg_box() {
        $("#incorrect-login").slideDown("slow");
    }

    function hide_incorrect_msg_box() {
        $("#incorrect-login").slideUp("slow");
    }

    function incorrect(msg) {
        counter++;
        var msgObject = $('<p style="magic-tab">' + msg + '</p>');
        $("#incorrect-wrapper").append(msgObject);
        msgObject.delay(4000).slideUp("slow", function() {
            $(this).remove();
            counter--;
        });
        trigger_drugs();
    }

    function trigger_drugs() {
        $("#incorrect-wrapper p").on("remove", function() {
            //console.log("aloha");
            if (counter === 1) { hide_incorrect_msg_box(); }

        });
    }
});