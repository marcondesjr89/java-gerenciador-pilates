package br.com.gerenciadorpilates;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentProgressEntryRepository;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.notifications.infrastructure.NotificationOutboxRepository;
import br.com.gerenciadorpilates.students.api.ConfigureStudentPortalAccountRequest;
import br.com.gerenciadorpilates.students.application.StudentPortalAccountService;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import br.com.gerenciadorpilates.platform.api.SystemInfoController.SystemInfoResponse;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.mock.web.MockMultipartFile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GerenciadorPilatesApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private br.com.gerenciadorpilates.platform.api.SystemInfoController controller;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentProgressEntryRepository progressEntryRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private StudentPortalAccountService studentPortalAccountService;

    @Autowired
    private NotificationOutboxRepository notificationOutboxRepository;

    @Test
    void contextLoads() {
        assertThat(controller).isNotNull();
        assertThat(mockMvc).isNotNull();
    }

    @Test
    void infoEndpointReturnsConfiguredApplicationName() {
        SystemInfoResponse response = controller.info();
        assertThat(response.applicationName()).isEqualTo("Gerenciador Pilates");
    }

    @Test
    void loginReturnsJwtForBootstrapAdmin() throws Exception {
        String request = """
                {
                  "email": "admin@test.local",
                  "password": "Admin@12345"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content(request))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.email").value("admin@test.local"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void authenticatedUserCanReadStudentDetails() throws Exception {
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Maria Silva",
                "12345678901",
                "maria@teste.local",
                "85999999999",
                LocalDate.of(1990, 5, 10),
                StudentStatus.ACTIVE,
                true
        ));

        String token = loginAndGetToken("admin@test.local", "Admin@12345");

        mockMvc.perform(get("/api/v1/students/{studentId}", student.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Maria Silva"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void authenticatedInstructorFlowCanUploadAndReadClinicalRecord() throws Exception {
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Ana Costa",
                "98765432100",
                "ana@teste.local",
                "85988888888",
                LocalDate.of(1988, 8, 20),
                StudentStatus.ACTIVE,
                true
        ));
        AppUser admin = appUserRepository.findByEmailIgnoreCaseAndActiveTrue("admin@test.local")
                .orElseThrow();

        StudentProgressEntry progressEntry = progressEntryRepository.save(new StudentProgressEntry(
                UUID.randomUUID(),
                student.getId(),
                admin.getId(),
                admin.getFullName(),
                OffsetDateTime.now(),
                "Melhora na mobilidade de quadril.",
                70,
                65,
                2
        ));

        String token = loginAndGetToken("admin@test.local", "Admin@12345");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "evolucao.png",
                "image/png",
                "conteudo-imagem".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/students/{studentId}/progress-entries/{progressEntryId}/attachments",
                                student.getId(), progressEntry.getId())
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalFileName").value("evolucao.png"))
                .andExpect(jsonPath("$.contentType").value("image/png"));

        mockMvc.perform(get("/api/v1/students/{studentId}/clinical-record", student.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.student.fullName").value("Ana Costa"))
                .andExpect(jsonPath("$.progressEntries[0].attachments[0].originalFileName").value("evolucao.png"));
    }

    @Test
    void receptionCanCreateSlotBookStudentAndCancelBooking() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor@teste.local",
                "Instrutor Teste",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_APARELHOS)
        ));
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Carlos Lima",
                "22233344455",
                "carlos@teste.local",
                "85977777777",
                LocalDate.of(1992, 1, 15),
                StudentStatus.ACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime start = OffsetDateTime.now().plusDays(1).withHour(13).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(1);

        String slotRequest = """
                {
                  "instructorUserId": "%s",
                  "requiredSpecialty": "PILATES_APARELHOS",
                  "startTime": "%s",
                  "endTime": "%s",
                  "capacity": 2
                }
                """.formatted(instructor.getId(), start, end);

        String slotResponse = mockMvc.perform(post("/api/v1/schedule-slots")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(slotRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.instructorName").value("Instrutor Teste"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID slotId = UUID.fromString(objectMapper.readTree(slotResponse).get("id").asText());

        String bookingRequest = """
                {
                  "studentId": "%s"
                }
                """.formatted(student.getId());

        String bookingResponse = mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/bookings", slotId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(bookingRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentName").value("Carlos Lima"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID bookingId = UUID.fromString(objectMapper.readTree(bookingResponse).get("id").asText());

        mockMvc.perform(get("/api/v1/schedule-slots")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("date", start.toLocalDate().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='%s')].bookedCount".formatted(slotId)).value(1))
                .andExpect(jsonPath("$[?(@.id=='%s')].availableSpots".formatted(slotId)).value(1));

        mockMvc.perform(delete("/api/v1/schedule-slots/{slotId}/bookings/{bookingId}", slotId, bookingId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));
    }

    @Test
    void selfServiceRescheduleFollowsConfiguredWindowAndCapacityRules() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor2@teste.local",
                "Instrutor Dois",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_REABILITACAO)
        ));
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Julia Alves",
                "55566677788",
                "julia@teste.local",
                "85966666666",
                LocalDate.of(1995, 6, 3),
                StudentStatus.ACTIVE,
                true
        ));
        studentPortalAccountService.configure(
                student.getId(),
                new ConfigureStudentPortalAccountRequest("julia@portal.local", "Aluno@12345")
        );

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        String studentToken = loginStudentPortalAndGetToken("julia@portal.local", "Aluno@12345");
        OffsetDateTime startA = OffsetDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endA = startA.plusHours(1);
        OffsetDateTime startB = startA.plusHours(2);
        OffsetDateTime endB = startB.plusHours(1);

        UUID slotA = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_REABILITACAO, startA, endA, 1);
        UUID slotB = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_REABILITACAO, startB, endB, 1);
        UUID bookingId = createBooking(adminToken, slotA, student.getId());

        String rescheduleRequest = """
                {
                  "targetSlotId": "%s"
                }
                """.formatted(slotB);

        mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/bookings/{bookingId}/self-service-reschedule", slotA, bookingId)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(APPLICATION_JSON)
                        .content(rescheduleRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canceledBooking.status").value("CANCELED"))
                .andExpect(jsonPath("$.newBooking.slotId").value(slotB.toString()))
                .andExpect(jsonPath("$.newBooking.studentName").value("Julia Alves"));
    }

    @Test
    void studentPortalLoginCanViewAndManageOwnBookings() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor3@teste.local",
                "Instrutor Tres",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Paula Mendes",
                "10120230344",
                "paula@teste.local",
                "85955555555",
                LocalDate.of(1994, 2, 12),
                StudentStatus.ACTIVE,
                true
        ));
        studentPortalAccountService.configure(
                student.getId(),
                new ConfigureStudentPortalAccountRequest("paula@portal.local", "Aluno@12345")
        );

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime startA = OffsetDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endA = startA.plusHours(1);
        OffsetDateTime startB = startA.plusHours(2);
        OffsetDateTime endB = startB.plusHours(1);
        UUID slotA = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_SOLO, startA, endA, 1);
        UUID slotB = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_SOLO, startB, endB, 1);
        UUID bookingId = createBooking(adminToken, slotA, student.getId());

        String studentToken = loginStudentPortalAndGetToken("paula@portal.local", "Aluno@12345");

        mockMvc.perform(get("/api/v1/student-portal/me/bookings")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(student.getId().toString()))
                .andExpect(jsonPath("$[0].slotId").value(slotA.toString()));

        String rescheduleRequest = """
                {
                  "targetSlotId": "%s"
                }
                """.formatted(slotB);

        mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/bookings/{bookingId}/self-service-reschedule", slotA, bookingId)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(APPLICATION_JSON)
                        .content(rescheduleRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newBooking.slotId").value(slotB.toString()));
    }

    @Test
    void waitlistPromotesFirstStudentAndCreatesNotificationWhenVacancyOpens() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor4@teste.local",
                "Instrutor Quatro",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_GESTANTES)
        ));
        Student studentA = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno A",
                "11111111111",
                "a@teste.local",
                "85944444441",
                LocalDate.of(1990, 1, 1),
                StudentStatus.ACTIVE,
                true
        ));
        Student studentB = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno B",
                "22222222222",
                "b@teste.local",
                "85944444442",
                LocalDate.of(1991, 1, 1),
                StudentStatus.ACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime start = OffsetDateTime.now().plusDays(1).withHour(15).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(1);
        UUID slotId = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_GESTANTES, start, end, 1);
        UUID bookingId = createBooking(adminToken, slotId, studentA.getId());

        String waitlistRequest = """
                {
                  "studentId": "%s"
                }
                """.formatted(studentB.getId());

        mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/waitlist", slotId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(waitlistRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentName").value("Aluno B"))
                .andExpect(jsonPath("$.status").value("WAITING"));

        mockMvc.perform(delete("/api/v1/schedule-slots/{slotId}/bookings/{bookingId}", slotId, bookingId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));

        mockMvc.perform(get("/api/v1/schedule-slots/{slotId}/bookings", slotId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentName").value("Aluno B"));

        assertThat(notificationOutboxRepository.count()).isPositive();
    }

    @Test
    void billingFlowCreatesPlanSubscriptionInvoiceListsOverdueAndRegistersPayment() throws Exception {
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Financeiro Aluno",
                "33344455566",
                "financeiro@teste.local",
                "85943332211",
                LocalDate.of(1987, 3, 7),
                StudentStatus.ACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");

        String planRequest = """
                {
                  "name": "Mensal 8 aulas",
                  "priceAmount": 450.00,
                  "billingCycleMonths": 1
                }
                """;

        String planResponse = mockMvc.perform(post("/api/v1/billing/plans")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(planRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Mensal 8 aulas"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID planId = UUID.fromString(objectMapper.readTree(planResponse).get("id").asText());

        LocalDate startDate = LocalDate.now().minusDays(15);
        String subscriptionRequest = """
                {
                  "studentId": "%s",
                  "planId": "%s",
                  "startDate": "%s"
                }
                """.formatted(student.getId(), planId, startDate);

        String subscriptionResponse = mockMvc.perform(post("/api/v1/billing/subscriptions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(subscriptionRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentName").value("Financeiro Aluno"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID subscriptionId = UUID.fromString(objectMapper.readTree(subscriptionResponse).get("id").asText());

        LocalDate dueDate = LocalDate.now().minusDays(1);
        String invoiceRequest = """
                {
                  "subscriptionId": "%s",
                  "dueDate": "%s"
                }
                """.formatted(subscriptionId, dueDate);

        String invoiceResponse = mockMvc.perform(post("/api/v1/billing/invoices/generate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(invoiceRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.amountDue").value(450.00))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID invoiceId = UUID.fromString(objectMapper.readTree(invoiceResponse).get("id").asText());

        mockMvc.perform(get("/api/v1/billing/invoices/overdue")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("baseDate", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(invoiceId.toString()))
                .andExpect(jsonPath("$[0].status").value("OPEN"));

        String paymentRequest = """
                {
                  "amountPaid": 450.00,
                  "paymentMethod": "PIX",
                  "paidAt": "%s",
                  "externalReference": "PIX-TST-001"
                }
                """.formatted(OffsetDateTime.now());

        mockMvc.perform(post("/api/v1/billing/invoices/{invoiceId}/payments", invoiceId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(paymentRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.invoiceId").value(invoiceId.toString()))
                .andExpect(jsonPath("$.paymentMethod").value("PIX"));

        mockMvc.perform(get("/api/v1/billing/invoices/student/{studentId}", student.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(invoiceId.toString()))
                .andExpect(jsonPath("$[0].status").value("PAID"));

        mockMvc.perform(get("/api/v1/billing/invoices/overdue")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("baseDate", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    private UUID createScheduleSlot(
            String token,
            UUID instructorId,
            InstructorSpecialty specialty,
            OffsetDateTime start,
            OffsetDateTime end,
            int capacity
    )
            throws Exception {
        String request = """
                {
                  "instructorUserId": "%s",
                  "requiredSpecialty": "%s",
                  "startTime": "%s",
                  "endTime": "%s",
                  "capacity": %d
                }
                """.formatted(instructorId, specialty.name(), start, end, capacity);

        String response = mockMvc.perform(post("/api/v1/schedule-slots")
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).get("id").asText());
    }

    private UUID createBooking(String token, UUID slotId, UUID studentId) throws Exception {
        String request = """
                {
                  "studentId": "%s"
                }
                """.formatted(studentId);

        String response = mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/bookings", slotId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).get("id").asText());
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        String request = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);

        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(response);
        return jsonNode.get("accessToken").asText();
    }

    private String loginStudentPortalAndGetToken(String email, String password) throws Exception {
        String request = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);

        String response = mockMvc.perform(post("/api/v1/student-portal/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(response);
        return jsonNode.get("accessToken").asText();
    }
}
