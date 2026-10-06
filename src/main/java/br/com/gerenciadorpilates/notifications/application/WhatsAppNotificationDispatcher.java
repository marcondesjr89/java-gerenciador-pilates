package br.com.gerenciadorpilates.notifications.application;

import br.com.gerenciadorpilates.notifications.domain.NotificationOutboxEntry;
import br.com.gerenciadorpilates.scheduling.application.ScheduleSlotService;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WhatsAppNotificationDispatcher {

    private static final TypeReference<Map<String, String>> STRING_MAP = new TypeReference<>() {
    };

    private final NotificationDispatchProperties properties;
    private final StudentRepository studentRepository;
    private final ScheduleSlotService slotService;
    private final ObjectMapper objectMapper;
    private final NotificationConsentPort consentPort;
    private final RestClient restClient;

    public WhatsAppNotificationDispatcher(
            NotificationDispatchProperties properties,
            StudentRepository studentRepository,
            ScheduleSlotService slotService,
            ObjectMapper objectMapper,
            NotificationConsentPort consentPort
    ) {
        this.properties = properties;
        this.studentRepository = studentRepository;
        this.slotService = slotService;
        this.objectMapper = objectMapper;
        this.consentPort = consentPort;
        this.restClient = RestClient.builder().build();
    }

    public void dispatch(NotificationOutboxEntry entry) {
        NotificationDispatchProperties.WhatsAppProperties whatsApp = properties.whatsapp();
        if (whatsApp == null || !whatsApp.enabled()) {
            throw new IllegalStateException("Despacho de WhatsApp desabilitado.");
        }
        if (whatsApp.webhookUrl() == null || whatsApp.webhookUrl().isBlank()) {
            throw new IllegalStateException("Webhook de WhatsApp nao configurado.");
        }

        Map<String, String> payload = parsePayload(entry.getPayloadJson());
        Student student = resolveStudent(entry.getRecipientReference(), payload);

        if (!consentPort.hasWhatsAppConsent(student.getId())) {
            throw new IllegalStateException("Aluno sem consentimento ativo para comunicacao por WhatsApp.");
        }

        String message = buildMessage(entry.getMessageTemplate(), student, payload);

        RestClient.RequestBodySpec request = restClient.post()
                .uri(whatsApp.webhookUrl())
                .contentType(MediaType.APPLICATION_JSON);

        if (whatsApp.authToken() != null && !whatsApp.authToken().isBlank()) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + whatsApp.authToken());
        }

        request.body(Map.of(
                "channel", "WHATSAPP",
                "phoneNumber", student.getPhoneNumber(),
                "studentId", student.getId().toString(),
                "studentName", student.getFullName(),
                "template", entry.getMessageTemplate(),
                "message", message,
                "payload", payload
        )).retrieve().toBodilessEntity();
    }

    private Map<String, String> parsePayload(String payloadJson) {
        try {
            return objectMapper.readValue(payloadJson, STRING_MAP);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Payload da notificacao invalido.", exception);
        }
    }

    private Student resolveStudent(String recipientReference, Map<String, String> payload) {
        String studentIdValue = payload.getOrDefault("studentId", recipientReference);
        UUID studentId = UUID.fromString(studentIdValue);
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Aluno destinatario da notificacao nao encontrado."));
    }

    private String buildMessage(String template, Student student, Map<String, String> payload) {
        return switch (template) {
            case "WAITLIST_PROMOTED" -> buildWaitlistPromotedMessage(student, payload);
            case "BOOKING_CONFIRMATION" -> buildBookingConfirmationMessage(student, payload);
            case "INVOICE_OPEN" -> buildInvoiceOpenMessage(student, payload);
            case "GENERIC_NOTICE" -> buildGenericNoticeMessage(student, payload);
            default -> throw new IllegalArgumentException("Template de notificacao nao suportado: " + template);
        };
    }

    private String buildWaitlistPromotedMessage(Student student, Map<String, String> payload) {
        String slotIdValue = payload.get("slotId");
        if (slotIdValue == null || slotIdValue.isBlank()) {
            throw new IllegalArgumentException("Payload sem slotId para notificacao WAITLIST_PROMOTED.");
        }

        ScheduleSlot slot = slotService.getEntityById(UUID.fromString(slotIdValue));
        String start = slot.getStartTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'as' HH:mm"));
        return "Ola, %s. Surgiu uma vaga no horario de Pilates de %s com %s.".formatted(
                student.getFullName(),
                start,
                slot.getInstructorName()
        );
    }

    private String buildBookingConfirmationMessage(Student student, Map<String, String> payload) {
        String slotIdValue = payload.get("slotId");
        if (slotIdValue == null || slotIdValue.isBlank()) {
            throw new IllegalArgumentException("Payload sem slotId para notificacao BOOKING_CONFIRMATION.");
        }

        ScheduleSlot slot = slotService.getEntityById(UUID.fromString(slotIdValue));
        String start = slot.getStartTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'as' HH:mm"));
        return "Ola, %s. Sua reserva para a aula de Pilates em %s com %s foi confirmada!".formatted(
                student.getFullName(),
                start,
                slot.getInstructorName()
        );
    }

    private String buildInvoiceOpenMessage(Student student, Map<String, String> payload) {
        String referenceMonth = payload.getOrDefault("referenceMonth", "do mes");
        String amount = payload.getOrDefault("amount", "");
        return "Ola, %s. Sua fatura de Pilates referente a %s no valor de R$ %s ja esta disponivel para pagamento.".formatted(
                student.getFullName(),
                referenceMonth,
                amount
        );
    }

    private String buildGenericNoticeMessage(Student student, Map<String, String> payload) {
        String text = payload.getOrDefault("message", "Aviso importante do Gerenciador Pilates.");
        return "Ola, %s. %s".formatted(student.getFullName(), text);
    }
}
