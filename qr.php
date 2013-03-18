<?php
require("./lib/phpqrcode/qrlib.php");
QRcode::png(!empty($_GET['url']) ? 'http://'.$_SERVER['HTTP_HOST'].'/' . $_GET['url'] : 'http://'.$_SERVER['HTTP_HOST'], false, QR_ECLEVEL_L, 7, 5);
?>