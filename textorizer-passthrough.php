<?php
 
$ch = curl_init( $_GET['url'] ); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);     
$response_headers = curl_getinfo($ch);     

if (curl_errno($ch)) {
    print curl_error($ch);
} else {
    curl_close($ch);
    header( 'Content-type: ' . $response_headers['content_type']);
    print $response;
}


?>