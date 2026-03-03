package com.gitten.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    mimeMessage, "utf-8");

            helper.setFrom(fromEmail, "GitTEnz");
            helper.setTo(to);
            helper.setSubject("GitTEnz Admin Login OTP");
            helper.setText("Your OTP for Admin Access is: " + otp
                    + "\n\nThis code expires in 5 minutes.\n\nRegards,\nGitTEnz Team");

            mailSender.send(mimeMessage);
            log.info("OTP Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
            // Fallback logging removed for security
        }
    }

    public boolean sendEmailVerification(String to, String verificationToken) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    mimeMessage, "utf-8");

            helper.setFrom(fromEmail, "GitTEnz");
            helper.setTo(to);
            helper.setSubject("GitTEnz - Verify Your Email Address");
            helper.setText("Hello,\n\n"
                    + "Please verify your email address by entering this verification code:\n\n"
                    + verificationToken + "\n\n"
                    + "This code expires in 10 minutes.\n\n"
                    + "If you didn't request this, please ignore this email.\n\n"
                    + "Regards,\nGitTEnz Team");

            mailSender.send(mimeMessage);
            log.info("[EMAIL] Verification email sent successfully to {}", to);
            return true;
        } catch (Exception e) {
            log.error("================================================================");
            log.error("[EMAIL FAILURE] Could not send verification email to: {}", to);
            log.error("[EMAIL FAILURE] Error type: {}", e.getClass().getSimpleName());
            log.error("[EMAIL FAILURE] Reason: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("[EMAIL FAILURE] Root cause: {}", e.getCause().getMessage());
            }
            log.error(
                    "[EMAIL FAILURE] This is likely because the hosting platform (e.g. Render free tier) blocks outbound SMTP port 587.");
            log.error(
                    "[EMAIL FAILURE] Fix: Upgrade Render plan, switch to Railway, or use an HTTP email API like Resend/Brevo.");
            log.error("================================================================");
            return false;
        }
    }

    public boolean sendEmail(String to, String subject, String body) {
        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    mimeMessage, "utf-8");

            helper.setFrom(fromEmail, "GitTEnz");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            mailSender.send(mimeMessage);
            log.info("[EMAIL] Email sent successfully to {}", to);
            return true;
        } catch (Exception e) {
            log.error("================================================================");
            log.error("[EMAIL FAILURE] Could not send email to: {}", to);
            log.error("[EMAIL FAILURE] Subject: {}", subject);
            log.error("[EMAIL FAILURE] Error type: {}", e.getClass().getSimpleName());
            log.error("[EMAIL FAILURE] Reason: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("[EMAIL FAILURE] Root cause: {}", e.getCause().getMessage());
            }
            log.error(
                    "[EMAIL FAILURE] This is likely because the hosting platform (e.g. Render free tier) blocks outbound SMTP port 587.");
            log.error(
                    "[EMAIL FAILURE] Fix: Upgrade Render plan, switch to Railway, or use an HTTP email API like Resend/Brevo.");
            log.error("================================================================");
            return false;
        }
    }
}
