package br.com.gerenciadorpilates.notifications.application;

import java.util.UUID;

public interface NotificationConsentPort {

    boolean hasWhatsAppConsent(UUID studentId);
}
