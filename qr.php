<?php
require("./lib/phpqrcode/qrlib.php");
QRcode::png(!empty($_GET['url']) ? 'http://remoteall.org/' . $_GET['url'] : 'http://remoteall.org', false, QR_ECLEVEL_L, 7, 5);
?>