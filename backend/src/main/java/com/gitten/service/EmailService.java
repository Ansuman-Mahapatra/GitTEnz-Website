package com.gitten.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtp(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("GitTEnz Admin Login OTP");
            message.setText("Your OTP for Admin Access is: " + otp
                    + "\n\nThis code expires in 5 minutes.\n\nRegards,\nGitTEnz Team");
            mailSender.send(message);
            log.info("OTP Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
            // Fallback logging removed for security
        }
    }

    public void sendEmailVerification(String to, String verificationToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("GitTEnz - Verify Your Email Address");
            message.setText("Hello,\n\n"
                    + "Please verify your email address by entering this verification code:\n\n"
                    + verificationToken + "\n\n"
                    + "This code expires in 10 minutes.\n\n"
                    + "If you didn't request this, please ignore this email.\n\n"
                    + "Regards,\nGitTEnz Team");
            mailSender.send(message);
            log.info("Verification email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email: {}", e.getMessage());
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
