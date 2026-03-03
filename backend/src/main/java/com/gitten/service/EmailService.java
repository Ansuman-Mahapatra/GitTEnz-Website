package com.gitten.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@Slf4j
@Service
public class EmailService {

    @Value("${RESEND_API_KEY:re_UHjY3RVA_8mrf7zmPa8QVQBqpA8KR7pRy}")
    private String resendApiKey;

    private final String url = "https://api.resend.com/emails";
    private final RestTemplate restTemplate = new RestTemplate();

    private boolean sendResendEmail(String to, String subject, String textBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            // Resend API requires the exact verified domain email if provided, otherwise
            // defaults to onboarding@resend.dev
            // Using GitTEnz to ensure proper display name without Google overriding it
            Map<String, Object> body = Map.of(
                    "from", "GitTEnz <onboarding@resend.dev>",
                    "to", List.of(to),
                    "subject", subject,
                    "text", textBody);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent via Resend API to {}", to);
                return true;
            } else {
                log.error("Failed to send email via Resend API. Status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to call Resend API: {}", e.getMessage());
            return false;
        }
    }

    public void sendOtp(String to, String otp) {
        String body = "Your OTP for Admin Access is: " + otp
                + "\n\nThis code expires in 5 minutes.\n\nRegards,\nGitTEnz Team";
        sendResendEmail(to, "GitTEnz Admin Login OTP", body);
    }

    public boolean sendEmailVerification(String to, String verificationToken) {
        String body = "Hello,\n\n"
                + "Please verify your email address by entering this verification code:\n\n"
                + verificationToken + "\n\n"
                + "This code expires in 10 minutes.\n\n"
                + "If you didn't request this, please ignore this email.\n\n"
                + "Regards,\nGitTEnz Team";
        return sendResendEmail(to, "GitTEnz - Verify Your Email Address", body);
    }

    public boolean sendEmail(String to, String subject, String body) {
        return sendResendEmail(to, subject, body);
    }
}
