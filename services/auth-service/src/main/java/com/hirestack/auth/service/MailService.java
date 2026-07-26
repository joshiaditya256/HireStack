package com.hirestack.auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public void sendOtpEmail(String toEmail, String otp) {
        String html = """
                <h2>OTP Verification</h2>
                <h1>%s</h1>
                <p>Expires in 15 minutes</p>
                """.formatted(otp);
        send(toEmail, "Your OTP Verification Code", html);
    }

    public void sendPasswordResetEmail(String toEmail, String userName, String resetUrl) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #000;">Password Reset Request</h2>
                    <p>Hello %s,</p>
                    <p>You recently requested to reset your password for your HireStack account. Click the button below to reset it:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
                    </div>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <p>This link will expire in 15 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #888;">Best regards,<br>The HireStack Team</p>
                </div>
                """.formatted(userName == null ? "User" : userName, resetUrl);
        send(toEmail, "Reset Your Password - HireStack", html);
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
