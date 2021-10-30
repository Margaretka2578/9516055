"use strict";
const widthWindow = document.documentElement.clientWidth,
      curtainBlock = document.querySelector('div.curtain');

let openGoal = 0,
    closeGoal = 1,
    countLine = 0,
    line = 0,
    calcCurrentValue = {};

let firstScreen = document.getElementById('main'),
    modalWrapper = curtainBlock.querySelector('.modal-wrapper'),
    promotionSection = document.getElementById('promotion'),
    calcForm = document.querySelector('.calculator-container'),
    calcResultBlock = document.getElementById('calcResult'),
    calcDelivery = document.getElementById('calcDelivery'),
    calcSection = document.getElementById('calcSection'),
    calcTotalSum = document.getElementById('calcTotalSum');

const fieldsCalc = calcForm.querySelectorAll('input, select');

/**данные для подсчёта стоимости работ калькулятором
 * 'height' - высота забора, в зависимости от коэффициента
 * 'costGate' - стоимость калиткок, в зависимости от количества [нет калитки, 1, 2, 3, 4, 5]
 * 'swingGates' - стоимсоть распашных ворот в зависимости о размера
 * 'slidingGates' - стоимость откатных ворот в зависимости от размера
 * 'baseCost' - базовая стоимость забора
 * 'k' - коэффициент для подсчёта стоимости в блоке Секций
 * 'typeColor' - коэффициенты на покраску [без покраски, с одной стороны, с двух сторон]
 * 'delivery' - минимальная стоимость доставки
 * 'km' - стоимость доставки за 1 км от КАД
*/

let calcData = {
    'height': {
        '0.7': 1.3,
        '0.8': 1.6,
        '0.9': 1.8,
        '1': 2,
        '1.1': 2.2,
        '1.2': 2.5,
        '1.3': 3,
        '1.4': 3.5,
        '1.5': 4,
        '1.6': 4.5,
        '1.7': 5,
    },
    'thickness':{
        '0.8':0.37,
        '1':0.4,
        '1.15':0.45,
        '1.25':0.5,
        '1.30':0.55,
        '1.35':0.6,
    },
    'costGate': [0, 2500, 5000, 7500, 10000, 12500],
    'swingGates': {
        '0': 0,
        '3.45': 6500,
        '4.35': 7500,
        '5.25': 9500,
    },
    'slidingGates': {
        '0': 0,
        '3': 20000,
        '4': 25000,
        '5': 30000,
        '7': 35000,
    },
    'baseCost': 1789,
    'k': 0.7,
    'typeColor': [0, 85, 180],
    'delivery': 7500,
    'km': 70,
};


/**
 * кроссплатформенное создание XMLHttpRequest
 *
 * @returns {*}
 */
 function getXmlHttp(){
    let xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest !== 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

// отслеживаем изменния в полях калькулятора, высчитываем новые значения и выводим их на экран
calcForm.addEventListener("input", (e) => {
    setTimeout(calcCurrentResult(e), 2000);
});

/**
 * Открытие диалоговога окна
 * @param {*} nameForm наименование формы, которую будут открывать
 * @returns
 */
function openDialog(nameForm) {

    let openForm;

    if (nameForm === "success-result" || nameForm === 'error-result' || nameForm === 'subscrube-result') {

        openForm = document.documentElement.querySelector('.' + nameForm);

    } else {

        openForm = document.documentElement.querySelector('form[name=' + nameForm + ']');

    }

    openForm.classList.add('active');

    curtainBlock.style.zIndex = "9999";
    curtainBlock.style.opacity = "1";

    setTimeout(modalWrapper.style.display = "block", 600);

    return false;
}

/**
 * Закрытие диалогового окна
 */
function closeDialog() {

    let currentForm = modalWrapper.querySelector('.active');

    modalWrapper.style.display = "none";
    currentForm.classList.remove('active');
    curtainBlock.style.zIndex = "-100";
    curtainBlock.style.opacity = "0";

}


/**
 * обработка данных форм перед отправкой
 * @param {*} frm element форма с которой приходят данные
 * @returns boolean false
 */

function sendForm(frm) {
    let nameForm = frm.getAttribute('name');
    data.form = nameForm;

    if (nameForm === 'result-calc-form') {

        let widthField = calcForm.querySelector("input[name='width']"),
            kmField = calcForm.querySelector("input[name='km']"),
            errorWidth = widthField.nextElementSibling,
            errorKm = kmField.nextElementSibling;

        if (widthField.value == '') {
            widthField.style.border = '1px solid #f00';
            errorWidth.innerText = "Укажите длину забора";
            closeDialog('result-calc-form');
            return false;
        } else {
            widthField.style.border = '';
            errorWidth.innerText = "";
        }

        if (kmField.value == "") {
            kmField.style.border = "1px solid #f00";
            errorKm.innerText = "Укажите расстояние от КАД";
            closeDialog('result-calc-form');
            return false;
        } else {
            kmField.style.border = "";
            errorKm.innerText = "";
        }
    }

    switch (nameForm) {

        case "feedback-form":
            userMessage = validateMessage(frm.querySelector('[name="message"]'));

            if (userName === false || userPhone === false || userMail === false || userMessage === false) {
                return false;
            }

            data.message = userMessage;
            data.reCaptcha = captcha;

        break;

        case 'result-calc-form':
            data.heightFence = fieldsCalc[0][fieldsCalc[0].options.selectedIndex].innerText;
            data.thicknessFence = fieldsCalc[1][fieldsCalc[1].options.selectedIndex].innerText;
            data.widthFence = fieldsCalc[2].value;
            data.typeColor = fieldsCalc[3][fieldsCalc[3].options.selectedIndex].innerText;
            data.gateFence = fieldsCalc[4][fieldsCalc[4].options.selectedIndex].innerText;
            data.swingGates = fieldsCalc[6][fieldsCalc[6].options.selectedIndex].innerText;
            data.slidingGates = fieldsCalc[7][fieldsCalc[7].options.selectedIndex].innerText;
            data.autoDrive = fieldsCalc[8][fieldsCalc[8].options.selectedIndex].innerText;
            data.km = fieldsCalc[5].value;
            let a = parseInt(calcResultBlock.innerText);
            let b = parseInt(calcDelivery.innerText);
            data.totalSum = a + b;

        break;
    }    

    data.name = userName;
    data.phone = userPhone;
    data.mail = userMail;

    let dataSend = 'data=' + JSON.stringify(data);

    let req = getXmlHttp();
        req.open('POST', '/send.php', true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if(req.status === 200) {

                    let answerServer = req.responseText;

                    if (answerServer === 'error captcha') {

                        captchaError.innerText = 'Не пройдена каптча! Попробуйте еще раз!';
                        grecaptcha.reset();

                    }

                    if (answerServer === "success") {

                        if (curtainBlock.style.opacity === "1") closeDialog();
                        let messageResultBlock = curtainBlock.querySelector('.success-result .message-result');

                        if (nameForm === 'consultation-form' || nameForm === "calculator-container" || nameForm === "result-calc-form" || nameForm === 'feedback-form') {
                            messageResultBlock.innerHTML = "<h3>Спасибо за Ваше обращение!</h3><p>Мы ответим Вам в течении 72 часов по указанному адресу электронной почты, либо по указанному контактному телефону.</p>";
                        }

                        if (nameForm === "result-calc-form") {
                            calcForm.reset();
                            calcResultBlock.innerText = '0';
                            calcDelivery.innerText = calcData['delivery'];
                            calcSection.innerText = "0 (0.00 м²)";
                            calcTotalSum.innerText = calcData['delivery'];
                        }

                        if (nameForm === 'subscribe-form') {

                            messageResultBlock.innerHTML = "<h3>Ваша заявка успешно отправлена!</h3><p>На Ваш почтовый адрес должно прийти письмо с подтверждением, что Вы являетесь владельцем данного почтового ящика. Если письмо не пришло, то проверьте папку <strong>СПАМ</strong>.</p>"

                        }

                        openDialog('success-result');

                    } else {

                        let messageResultBlock = curtainBlock.querySelector('.error-result .message-result');

                        messageResultBlock.innerHTML = "<h3>Ошибка!</h3><p>Произошла ошибка, попробуйте отправить заявку позже или свяжитесь с нами по указанным телефонам</p>"
                    }

                    frm.reset();
                }
            }
        }

        req.send(dataSend);

    return false;
}


/**
 * Валидация поля с именем пользователя
 * @param {*} userName
 * @param {*} fieldName
 */
 function validateName(field) {


    let userName = field.value;

    userName = trimStr(userName);

    if (!userName) {

        alert("Введите Ваше имя");
        return false;

    }

    if (userName.length > 70) {

        alert("Слишком длинное имя");
        return false;

    }

    return userName;
}

/**
 * Проверка номера телефона
 * проверяется наличие впереди знака + или цифры
 * далее наличие цифр, символов скобок ( ) , двоеточия :, дефиса -
 * без определённого патерна ввода
 * при несоответствии возвращается 1
 */
function validatePhone(field) {

    let userPhone = field.value;
    let reg = /^[\d+][\d\(\)\ -]{4,20}\d$/;

    userPhone = trimStr(userPhone);

    if (!userPhone) {

        alert ("Введите номер телефона");
        return false;

    }

    if(userPhone.search(reg) === -1) {

        alert("В номере телефона могут быть только цифры, знаки + ( ) : -");
        return false;

    }

    return userPhone;

}

/**
 * Проверка e-mail
 * Регулярное выражение проверки e-mail (HTML5 спецификация)
 * при несоответствии возвращается 1
 */
function validateEmail(field) {

    let emailRegExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    let userEmail = field.value;

    userEmail = trimStr(userEmail);

    if (!userEmail) {

        // field.classList.add('has-error');
        alert("Введите Ваш email");
        return false;

    }

    if(userEmail.search(emailRegExp) === -1) {

        // field.classList.add('has-error');
        alert("Не корректный email");

        // field.parentElement.classList.add('has-error');
        return false;

    }

    // field.classList.remove('has-error');

    return userEmail;

}

/**
 * Проверка сообщения
 *
 */
function validateMessage(field) {

    let userMessage = field.value;

    userMessage = trimStr(userMessage);

    if (!userMessage) {

        alert("Введите текст сообщения");
        return false;

    }

    // if (userMessage.length > 1000) {

    //     alert("Слишком большое сообщение");
    //     return false;

    // }

    return userMessage;

}

/**
 * Очистка текста от пробелов в начале и в конце строки
 * удаляются все пробелы в начале и в конце строки
 * возвращается строка, очищенная от пробелов в начале и в конце
 */
function trimStr(s) {

    s = s.replace( /^\s+/g, '');
    return s.replace( /\s+$/g, '');

}

$(function(){
    $('.minimized').click(function(event) {
        let i_path = $(this).attr('src');
      $('body').append('<div id="overlay"></div><div id="magnify"><img src="'+i_path+'"><div id="close-popup"><i></i></div></div>');
      $('#magnify').css({
       left: ($(document).width() - $('#magnify').outerWidth())/2,
    //    top: ($(document).height() - $('#magnify').outerHeight())/2 upd: 24.10.2016
        top: ($(window).height() - $('#magnify').outerHeight())/2
     });
      $('#overlay, #magnify').fadeIn('fast');
    });

    $('body').on('click', '#close-popup, #overlay', function(event) {
      event.preventDefault();
      $('#overlay, #magnify').fadeOut('fast', function() {
        $('#close-popup, #magnify, #overlay').remove();
      });
    });
});

/**
 * Вычисление калькулятора
 */
function calcCurrentResult(e) {

    let heightFence = parseInt(fieldsCalc[0][fieldsCalc[0].options.selectedIndex].value);
    let thickFence =  parseInt(fieldsCalc[1][fieldsCalc[1].options.selectedIndex].value);
    let widthFence = parseFloat(fieldsCalc[2].value);
    let typeColor = parseInt(fieldsCalc[4][fieldsCalc[4].options.selectedIndex].value);
    let km = parseInt(fieldsCalc[5].value);
    let gateFence = parseInt(fieldsCalc[6][fieldsCalc[6].options.selectedIndex].value);
    let swingGates = parseFloat(fieldsCalc[7][fieldsCalc[7].options.selectedIndex].value);
    let slidingGates = parseFloat(fieldsCalc[8][fieldsCalc[8].options.selectedIndex].value);
    let autoDrive = parseInt(fieldsCalc[9][fieldsCalc[9].options.selectedIndex].value);
   
    //получаем наименование элемента, который был изменён
    let changeElem = e.target,
    nameElem = changeElem.name;

    calcCurrentValue[nameElem] = changeElem.value;

    //if (nameElem === "unclude-gates") {
        // Если устаонвлен чекбокс "Включая длину ворот и калиток", то преобразуем в 0 или 1
      //  (changeElem.checked) ? calcCurrentValue[nameElem] = '1' : calcCurrentValue[nameElem] = '0';
    //}
    let uncludeGate;
    document.getElementById("unclude-gate").checked ? uncludeGate = 1 : uncludeGate = 0;

    let costFence = 0;
       // widthFence = 0;           
        
    // console.log(calcCurrentValue);
    
    //widthFence = +calcCurrentValue['width'];
    //costFence += calcData['baseCost'] + calcData['typeColor'][calcCurrentValue['type-color']];    
    //costFence *= calcCurrentValue['height'];
    //costFence *= calcCurrentValue['thickness'];

    costFence += calcData['baseCost'] + calcData['typeColor'][typeColor];
    costFence *= heightFence;
    costFence *= thickFence;
    
    // Если убрана галочка "Включая длину ворот и калиток", то к длине забора прибавляем
    // длину калитки и забора
    //if (calcCurrentValue['unclude-gates'] === "0") {
    //    widthFence += +calcCurrentValue['gate'];
    //    widthFence += parseFloat(calcCurrentValue['swing-gates']);
    //    widthFence += parseFloat(calcCurrentValue['sliding-gates']);
   // }

   if (uncludeGate === 1) {
        widthFence -= gateFence;
        widthFence -= swingGates;
        widthFence -= slidingGates;
   }
   
   console.log('widthFence = ', widthFence);
   costFence *= widthFence;
   
   // Плюсуем стоимость калитки, ворот и автопривода
    //costFence += calcData['costGate'][calcCurrentValue['gate']];
    //costFence += calcData['swingGates'][calcCurrentValue['swing-gates']];
    //costFence += calcData['slidingGates'][calcCurrentValue['sliding-gates']];
    //costFence += +calcCurrentValue['auto-drive'];

    costFence += calcData['costGate'][gateFence];
    costFence += calcData['swingGates'][swingGates];
    costFence += calcData['slidingGates'][slidingGates];
    costFence += autoDrive; 

    costFence = Math.ceil(costFence);
    console.log('costFence = ', costFence);

    calcResultBlock.innerText = costFence;

   // if (nameElem === 'km') {
        //calcDelivery.innerText = Math.ceil(calcData['delivery'] + (changeElem.value * calcData['km'])); 
        calcDelivery.innerText = Math.ceil(calcData['delivery'] + (km * calcData['km']));
   // }

    let quantitySection = Math.ceil(widthFence / 1.15);
    //let areaFence = calcData['height'][calcCurrentValue['height']] * 1.20 * quantitySection;
    let areaFence = calcData['height'][heightFence] * 1.20 * quantitySection;

    // Вычисляем сумму выводимую в блоке секций
    // от полной стоимости отнимаем стоимость калиток, ворот, автопривода
    // умножаем на коэффициент и прибавляем стоимость доставки
    let totalFenceSum = costFence - calcData['costGate'][gateFence];
    totalFenceSum -= calcData['swingGates'][swingGates];
    totalFenceSum -= calcData['slidingGates'][slidingGates];   
    totalFenceSum -= autoDrive;
    totalFenceSum *= calcData['k'];

    totalFenceSum += calcDelivery.innerText;

    calcSection.innerText = quantitySection + " (" + areaFence.toFixed(2) + " м²)";

    calcTotalSum.innerText = Math.ceil(totalFenceSum);

}

$(document).ready(function() {
    $(".mobile-menu").on('click', function()  {
        $(this).toggleClass("is-active");
    })    
})
