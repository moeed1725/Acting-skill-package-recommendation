<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require './vendor/autoload.php';

header('Content-Type: application/json'); // ✅ return JSON always

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

$name  = trim($_POST['name']  ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'moeed1231@gmail.com';
    $mail->Password   = 'udla byfu ktik ohtq'; // Gmail App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('moeed1231@gmail.com', 'MOEED TECH');

    if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($email, $name ?: 'Visitor');
        $mail->addAddress($email, $name);
    }

    $mail->isHTML(true);
    $mail->Subject = 'SUMMARY';
    $mail->Body = "
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> " . htmlspecialchars($name) . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
        " . ($phone ? "<p><strong>Phone:</strong> " . htmlspecialchars($phone) . "</p>" : "") . "
    ";
    $mail->AltBody = "Name: $name\nEmail: $email\nPhone: $phone\n";

    $mail->send();

    echo json_encode(["status" => "success", "message" => "Email sent successfully"]);
    exit;

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $mail->ErrorInfo]);
    exit;
}
