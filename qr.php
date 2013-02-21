<?php 
require("./lib/phpqrcode/qrlib.php");
QRcode::png(!empty($_GET['url'])?'http://remoteall.org/'.$_GET['url']:'http://remoteall.org',false,15);
?>