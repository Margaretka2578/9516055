<?php

require_once __DIR__ . '/recaptchalib.php';

$protocol="http";
$secretCaptcha = '6Lf93hgcAAAAALnBFzpsGN-uIMbfJGXimawWOZZe';
$responseCaptcha = null;

if($_SERVER['HTTPS']) $protocol = 'https';

if ($_POST) {

    $dataJson = $_POST['data'];

    $data = json_decode($dataJson, true);

    $currentForm = $data['form'];

    if ($currentForm == "feedback-form") {

        $reCaptcha = new ReCaptcha($secretCaptcha);

        if ($data["reCaptcha"]) {

            $responseCaptcha = $reCaptcha->verifyResponse(
                $_SERVER["REMOTE_ADDR"],
                $data["reCaptcha"]
            );

        }

        if ($responseCaptcha == null && !$responseCaptcha->success) {

            echo 'error captcha';
            exit();

        }

    }

    //$to = 'info@order-work.ru';
    // $to = "businessbank@mail.ru";
    $to = "moroslina@yandex.ru";
    $message = "";
    $sub = "";

    switch ($currentForm) {

        case "subscribe-form":

            $idSubscrube = time();

            $strData = '';

            $strData .= '[' . $idSubscrube . ']' . PHP_EOL;
            $strData .= 'name = "' . $data['name'] . '"' . PHP_EOL;
            $strData .= 'email = "' . $data['mail'] . '"' . PHP_EOL;
            $strData .= 'phone = "' . $data['phone'] . '"' . PHP_EOL;

            file_put_contents(__DIR__ . '/subscrube-request.ini', $strData, FILE_APPEND | LOCK_EX);

            $to = $data['mail'];
            $sub = "Подписка с сайта " . $_SERVER['SERVER_NAME'];
            $message = "<html>
                        <body>
                        <p>Здравствуйте!</p>
                        <p>Для подтверждения E-mail перейдите по ссылке<p>
                        <p><a href='" . $protocol . "://" . $_SERVER['SERVER_NAME'] . "/subscrube.php?id=" . $idSubscrube . "'>" . $protocol . "://" . $_SERVER['SERVER_NAME'] . "/subscrube.php?id=" . $idSubscrube . "</a><p>
                        </body>
                        </html>";
            break;

        case "feedback-form":
            $sub = "Сообщение с сайта " . $_SERVER['SERVER_NAME'];
            $message = "<html>
                        <body>
                        <p><strong>Дата:</strong> " . date('d.m.Y H:i:s') . "</p>
                        <p><strong>Имя:</strong> " . $data['name'] . " </p>
                        <p><strong>E-mail:</strong> " . $data['mail'] . "<p>
                        <p><strong>Телефон:</strong> " . $data['phone'] . "<p>
                        <p><strong>Сообщение:</strong> " . $data['message'] . "<p>
                        </body>
                        </html>";
            break;

        case "consultation-form":
            $sub = "Заявка на бесплатную консультацию с сайта " . $_SERVER['SERVER_NAME'];
            $message = "<html>
                        <body>
                        <h3>Заявка на бесплатную консультацию</h3>
                        <p><strong>Дата:</strong> " . date('d.m.Y H:i:s') . "</p>
                        <p><strong>Имя:</strong> " . $data['name'] . "</p>
                        <p><strong>E-mail:</strong> " . $data['mail'] . "<p>
                        <p><strong>Телефон:</strong> " . $data['phone'] . "<p>
                        </body>
                        </html>";
            break;

        case "result-calc-form":
            $sub = "Заявка на расчёт цены забора с сайта " . $_SERVER['SERVER_NAME'];
            $message = "<html>
                        <body>
                        <p><strong>Дата:</strong> " . date('d.m.Y H:i:s') . "</p>
                        <p><strong>Имя:</strong> " . $data['name'] . "</p>
                        <p><strong>E-mail:</strong> " . $data['mail'] . "<p>
                        <p><strong>Телефон:</strong> " . $data['phone'] . "<p>
                        <hr>
                        <div style='padding-top: 15px'>
                            <table>
                                <tr>
                                    <td><strong>Высота забора</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['heightFence'] . "</td>
                                </tr>
                                <tr>
                                    <td><strong>Толщина листа</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['thicknessFence'] . "</td>
                                </tr>
                                <tr>
                                    <td><strong>Длина забора</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['widthFence'] . " м</td>
                                </tr>
                                <tr>
                                    <td><strong>Покраска</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['typeColor']  . "</td>
                                </tr>
                                <tr>
                                    <td><strong>Калитка 1м</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['gateFence'] . "</td>
                                </tr>
                                <tr>
                                    <td><strong>Ворота распашные</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['swingGates'] . "</td>
                                </tr>
                                <tr>
                                    <td><strong>Ворота откатные</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['slidingGates'] . "</td>
                                </tr>
                                <tr>
                                    <td><strong>Автопривод</strong></td>
                                    <td style='padding-left: 10px; text-align: center;'>" . $data['autoDrive'] . "</td>
                                </tr>
                                <tr>
                                    <td style='padding-bottom: 5px; border-bottom: 1px solid #000'><strong>Расстояние от КАД</strong></td>
                                    <td style='padding: 0 0 5px 10px; text-align: center; border-bottom: 1px solid #000'>" . $data['km'] . " км</td>
                                </tr>
                                <tr>
                                    <td style='padding-top: 5px; font-size: larger;'> <strong>ИТОГО:</strong></td>
                                    <td style='padding: 5px 0 0 10px; text-align: center; font-size: larger;'><strong>" . $data['totalSum'] . " руб.</strong></td>
                                </tr>
                            </table>
                        </div>
                        </body>
                        </html>";
            break;

    }

    $headers  = 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
    $headers .= 'From: info@order-work.ru' . "\r\n";

    $send = mail($to, $sub, $message, $headers);

    if ($send) {

        echo 'success';

    } else {

        echo 'error';

    }

    exit();
}
