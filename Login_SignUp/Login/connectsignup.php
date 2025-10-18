<?php
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $phone = $_POST['phone'];
    $county = $_POST['county'];
    $pincode = $_POST['pincode'];
    $address = $_POST['address'];
    $city = $_POST['city'];


    $conn = new mysqli('localhost','root','','ev');
    if($conn -> connect_error){
        die('connection failed : '.$conn->connect_error);

    }else{
        $stmt = $conn->prepare("insert into signup(firstname,lastname,email,password,phone,county,pincode,address,city")values(?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("ssssisiss",$firstname,$lastname,$email,$password,$phone,$county,$pincode,$address,$city);
        $stmt->execute();
        echo "registratation successfully"
        $stmt->close();
        $conn->close();
    }
