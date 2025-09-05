<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require './vendor/autoload.php';

$mail = new PHPMailer(true);

// Collect form input safely
$name    = trim($_POST['name']  ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$message = trim($_POST['message'] ?? '');

try {
    $mail->SMTPDebug = 0; // set 2 only if debugging
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'moeed1231@gmail.com';
    $mail->Password   = 'udla byfu ktik ohtq'; // Gmail App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('moeed1231@gmail.com', 'MOEED TECH');

    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($email, $name ?: 'MD');
    }

    // Send to user
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mail->addAddress($email, $name);
    }

    $mail->isHTML(true);
    $mail->Subject = 'SUMMARY';
    $mail->Body = "
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ".htmlspecialchars($name)."</p>
        <p><strong>Email:</strong> ".htmlspecialchars($email)."</p>
        ".($phone ? "<p><strong>Phone:</strong> ".htmlspecialchars($phone)."</p>" : "")."
        <hr>
        <p>".nl2br(htmlspecialchars($message))."</p>
    ";
    $mail->AltBody = "Name: $name\nEmail: $email\nPhone: $phone\n\nMessage:\n$message";

    // ✅ Only send once
    $mail->send();

    // ✅ Redirect after success
    header("Location: index.html?status=success");
    exit;

} catch (Exception $e) {
    header("Location: index.html?status=error");
    exit;
}
