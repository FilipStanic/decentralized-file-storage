<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email Address</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #6366F1;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            border: 1px solid #ddd;
            border-top: none;
            padding: 20px;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            background-color: #6366F1;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
<div class="header">
    <h1>BlockStore</h1>
</div>
<div class="content">
    <h2>Verify Your Email Address</h2>
    <p>Hello,</p>
    <p>Please click the button below to verify your email address.</p>
    <p><a class="button" href="{{ $url }}">Verify Email Address</a></p>
    <p>If you did not create an account, no further action is required.</p>
    <p>Regards,<br>BlockStore Team</p>
</div>
</body>
</html>
