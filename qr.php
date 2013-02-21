<?php 
require("./lib/phpqrcode/qrlib.php");
QRcode::png(!empty($_GET['url'])?'http://allremote.org/'.$_GET['url']:'http://remoteall.org',false,8);
?>