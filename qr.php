<?php 
require("./lib/phpqrcode/qrlib.php");
QRcode::png(!empty($_GET['code'])?$_GET['code']:'http://remoteall.org',false,8);
?>