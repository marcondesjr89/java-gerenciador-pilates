package br.com.gerenciadorpilates;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import br.com.gerenciadorpilates.clinical.domain.StudentAnamnesis;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentAnamnesisRepository;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentProgressEntryRepository;
import br.com.gerenciadorpilates.billing.infrastructure.BillingInvoiceRepository;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
import br.com.gerenciadorpilates.identityaccess.domain.InstructorSpecialty;
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
import br.com.gerenciadorpilates.notifications.infrastructure.NotificationOutboxRepository;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleBooking;
import br.com.gerenciadorpilates.scheduling.domain.ScheduleSlot;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleBookingRepository;
import br.com.gerenciadorpilates.scheduling.infrastructure.ScheduleSlotRepository;
import br.com.gerenciadorpilates.students.api.ConfigureStudentPortalAccountRequest;
import br.com.gerenciadorpilates.students.application.StudentPortalAccountService;
import br.com.gerenciadorpilates.students.domain.Student;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptance;
import br.com.gerenciadorpilates.students.domain.StudentLegalAcceptanceStatus;
import br.com.gerenciadorpilates.students.domain.StudentLegalCollectionMethod;
import br.com.gerenciadorpilates.students.domain.StudentLegalTermType;
import br.com.gerenciadorpilates.students.domain.StudentStatus;
import br.com.gerenciadorpilates.students.infrastructure.StudentLegalAcceptanceRepository;
import br.com.gerenciadorpilates.students.infrastructure.StudentRepository;
import br.com.gerenciadorpilates.platform.api.SystemInfoController.SystemInfoResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import org.springframework.mock.web.MockMultipartFile;
import org.junit.jupiter.api.Test;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
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
    private StudentLegalAcceptanceRepository studentLegalAcceptanceRepository;

    @Autowired
    private StudentProgressEntryRepository progressEntryRepository;

    @Autowired
    private StudentAnamnesisRepository anamnesisRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private StudentPortalAccountService studentPortalAccountService;

    @Autowired
    private NotificationOutboxRepository notificationOutboxRepository;

    @Autowired
    private BillingInvoiceRepository billingInvoiceRepository;

    @Autowired
    private ScheduleSlotRepository scheduleSlotRepository;

    @Autowired
    private ScheduleBookingRepository scheduleBookingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    void studentSearchSupportsQueryAndPagination() throws Exception {
        studentRepository.save(new Student(
                UUID.randomUUID(),
                "Ana Busca",
                "12345678901",
                "ana.busca@teste.local",
                "85991111111",
                LocalDate.of(1991, 4, 10),
                StudentStatus.ACTIVE,
                true
        ));
        studentRepository.save(new Student(
                UUID.randomUUID(),
                "Bruno Busca",
                "12345678902",
                "bruno.busca@teste.local",
                "85992222222",
                LocalDate.of(1992, 5, 11),
                StudentStatus.INACTIVE,
                false
        ));
        studentRepository.save(new Student(
                UUID.randomUUID(),
                "Carla Outro",
                "12345678903",
                "carla@teste.local",
                "85993333333",
                LocalDate.of(1993, 6, 12),
                StudentStatus.ACTIVE,
                true
        ));

        String token = loginAndGetToken("admin@test.local", "Admin@12345");

        mockMvc.perform(get("/api/v1/students/search")
                        .header("Authorization", "Bearer " + token)
                        .param("q", "busca")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].fullName").value("Ana Busca"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.summary.totalStudents").value(3))
                .andExpect(jsonPath("$.summary.activeStudents").value(2))
                .andExpect(jsonPath("$.summary.inactiveStudents").value(1))
                .andExpect(jsonPath("$.summary.lgpdStudents").value(2));
    }

    @Test
    void studentSearchSupportsMaskedCpfAndPhone() throws Exception {
        studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Documento",
                "12345678901",
                "documento@teste.local",
                "85991112222",
                LocalDate.of(1991, 4, 10),
                StudentStatus.ACTIVE,
                true
        ));
        studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Telefone",
                "98765432100",
                "telefone@teste.local",
                "85993334444",
                LocalDate.of(1992, 5, 11),
                StudentStatus.ACTIVE,
                true
        ));

        String token = loginAndGetToken("admin@test.local", "Admin@12345");

        mockMvc.perform(get("/api/v1/students/search")
                        .header("Authorization", "Bearer " + token)
                        .param("q", "123.456.789-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].fullName").value("Aluno Documento"));

        mockMvc.perform(get("/api/v1/students/search")
                        .header("Authorization", "Bearer " + token)
                        .param("q", "(85) 99333-4444"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].fullName").value("Aluno Telefone"));
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
    void legalAcceptanceDocumentCanBeDownloadedAndVerifiedPublicly() throws Exception {
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Laura Documento",
                "12312312399",
                "laura.documento@teste.local",
                "85995554433",
                LocalDate.of(1994, 3, 21),
                StudentStatus.ACTIVE,
                true
        ));

        StudentLegalAcceptance acceptance = studentLegalAcceptanceRepository.save(new StudentLegalAcceptance(
                UUID.randomUUID(),
                student.getId(),
                StudentLegalTermType.LGPD_DATA_PROCESSING,
                java.util.List.of(
                        StudentLegalTermType.LGPD_DATA_PROCESSING,
                        StudentLegalTermType.WHATSAPP_COMMUNICATION
                ),
                "Termo de tratamento de dados",
                "v2026.04",
                "Consentimento",
                sha256("Texto oficial do termo LGPD"),
                "Texto oficial do termo LGPD",
                StudentLegalAcceptanceStatus.ACCEPTED,
                StudentLegalCollectionMethod.INTERNAL_RECORD,
                OffsetDateTime.now().minusMinutes(10),
                "Aceite consolidado no atendimento interno.",
                UUID.randomUUID(),
                "Administrador Teste",
                "127.0.0.1",
                "JUnit",
                "sessao-teste-aceite",
                "internal-web-desktop"
        ));

        String token = loginAndGetToken("admin@test.local", "Admin@12345");
        String verificationCode = sha256("%s|%s|%s|%s".formatted(
                acceptance.getId(),
                acceptance.getTermsVersion(),
                acceptance.getDocumentHash(),
                acceptance.getAcceptedAt().toInstant()
        )).substring(0, 16).toUpperCase();
        MockMultipartFile tabletSignature = new MockMultipartFile(
                "tabletSignatureFile",
                "assinatura.png",
                "image/png",
                """
                \u0089PNG\r\n\u001a\n\u0000\u0000\u0000\rIHDR\u0000\u0000\u0000\u0001\u0000\u0000\u0000\u0001\b\u0002\u0000\u0000\u0000\u0090wS\u00de\u0000\u0000\u0000\u000cIDATx\u009cc```\u0000\u0000\u0000\u0004\u0000\u0001\u000b\u00e7\u0002\u009d\u0000\u0000\u0000\u0000IEND\u00aeB`\u0082
                """.getBytes(StandardCharsets.ISO_8859_1)
        );

        mockMvc.perform(multipart("/api/v1/students/{studentId}/legal-acceptances/{acceptanceId}/attachments",
                                student.getId(), acceptance.getId())
                        .file(tabletSignature)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].attachmentType").value("TABLET_SIGNATURE"));

        byte[] pdfBytes = mockMvc.perform(get("/api/v1/students/{studentId}/legal-acceptances/{acceptanceId}/document",
                                student.getId(), acceptance.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Type", "application/pdf"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Disposition", containsString("attachment;")))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Disposition", containsString("aceite-legal-v2026.04-" + acceptance.getId() + ".pdf")))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        assertThat(new String(pdfBytes, 0, 4, StandardCharsets.US_ASCII)).isEqualTo("%PDF");
        String pdfText = extractTextFromPdf(pdfBytes);
        assertThat(pdfText).contains("Emitente institucional");
        assertThat(pdfText).contains("Referencia formal do documento");
        assertThat(pdfText).contains("Previa da assinatura coletada");
        assertThat(pdfText).contains("Abrangencia: Aceite consolidado em coleta unica");
        assertThat(pdfText).contains("Laura Documento");

        mockMvc.perform(get("/api/v1/public/legal-acceptances/{acceptanceId}/verification", acceptance.getId())
                        .param("code", verificationCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.studentName").value("Laura Documento"))
                .andExpect(jsonPath("$.termsVersion").value("v2026.04"))
                .andExpect(jsonPath("$.documentHash").value(acceptance.getDocumentHash()))
                .andExpect(jsonPath("$.coveredTermTypes[0]").value("LGPD_DATA_PROCESSING"))
                .andExpect(jsonPath("$.coveredTermTypes[1]").value("WHATSAPP_COMMUNICATION"))
                .andExpect(jsonPath("$.issuerName").value("Studio Pilates Exemplo Ltda"))
                .andExpect(jsonPath("$.issuerDocument").value("12.345.678/0001-99"))
                .andExpect(jsonPath("$.documentReference").value("ACEITE-V202604-" + acceptance.getId().toString().substring(0, 8).toUpperCase()))
                .andExpect(jsonPath("$.verificationStatement").value("O documento consultado corresponde a um aceite consolidado, formalizado em coleta unica e vinculado ao hash versionado armazenado no sistema."));

        mockMvc.perform(get("/api/v1/public/legal-acceptances/{acceptanceId}/verification", acceptance.getId())
                        .param("code", "CODIGOINVALIDO123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(false))
                .andExpect(jsonPath("$.verificationCode").value(verificationCode))
                .andExpect(jsonPath("$.documentReference").value("ACEITE-V202604-" + acceptance.getId().toString().substring(0, 8).toUpperCase()));
    }

    @Test
    void receptionCanListActiveInstructorsForScheduling() throws Exception {
        appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "recepcao@teste.local",
                "Recepcao Teste",
                passwordEncoder.encode("Admin@12345"),
                UserRole.RECEPTION,
                true,
                java.util.Set.of()
        ));
        appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.lista@teste.local",
                "Instrutor da Lista",
                passwordEncoder.encode("Admin@12345"),
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_REABILITACAO)
        ));
        appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.inativo@teste.local",
                "Instrutor Inativo",
                passwordEncoder.encode("Admin@12345"),
                UserRole.INSTRUCTOR,
                false,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));

        String receptionToken = loginAndGetToken("recepcao@teste.local", "Admin@12345");

        mockMvc.perform(get("/api/v1/users/instructors")
                        .header("Authorization", "Bearer " + receptionToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.fullName=='Instrutor da Lista')]").exists())
                .andExpect(jsonPath("$[0].specialties[0]").value("PILATES_REABILITACAO"))
                .andExpect(jsonPath("$[?(@.fullName=='Instrutor Inativo')]").isEmpty());
    }

    @Test
    void instructorDayScheduleReturnsAggregatedSlotsBookingsAndClinicalSummary() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.agregado@teste.local",
                "Instrutor Agregado",
                passwordEncoder.encode("Admin@12345"),
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));
        AppUser otherInstructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.outro@teste.local",
                "Outro Instrutor",
                passwordEncoder.encode("Admin@12345"),
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Agregado",
                "32165498700",
                "agregado@teste.local",
                "85994445555",
                LocalDate.of(1990, 7, 10),
                StudentStatus.ACTIVE,
                true
        ));
        OffsetDateTime start = OffsetDateTime.parse("2026-05-20T10:00:00Z");
        ScheduleSlot slot = new ScheduleSlot(
                UUID.randomUUID(),
                instructor.getId(),
                instructor.getFullName(),
                InstructorSpecialty.PILATES_SOLO,
                start,
                start.plusHours(1),
                3
        );
        slot.incrementBookedCount();
        scheduleSlotRepository.save(slot);
        ScheduleSlot otherSlot = new ScheduleSlot(
                UUID.randomUUID(),
                otherInstructor.getId(),
                otherInstructor.getFullName(),
                InstructorSpecialty.PILATES_SOLO,
                start,
                start.plusHours(1),
                3
        );
        scheduleSlotRepository.save(otherSlot);
        scheduleBookingRepository.save(new ScheduleBooking(
                UUID.randomUUID(),
                slot.getId(),
                student.getId(),
                student.getFullName()
        ));
        anamnesisRepository.save(new StudentAnamnesis(
                UUID.randomUUID(),
                student.getId(),
                false,
                null,
                false,
                null,
                true,
                "Dor lombar leve.",
                false,
                false,
                false,
                true,
                "Evitar carga axial intensa."
        ));
        progressEntryRepository.save(new StudentProgressEntry(
                UUID.randomUUID(),
                student.getId(),
                instructor.getId(),
                instructor.getFullName(),
                start.minusDays(1),
                "Boa resposta ao controle de tronco.",
                70,
                75,
                2
        ));
        progressEntryRepository.save(new StudentProgressEntry(
                UUID.randomUUID(),
                student.getId(),
                instructor.getId(),
                instructor.getFullName(),
                start.minusHours(2),
                "Evolucao mais recente usada no resumo.",
                80,
                85,
                1
        ));

        String instructorToken = loginAndGetToken("instrutor.agregado@teste.local", "Admin@12345");

        mockMvc.perform(get("/api/v1/schedule-slots/instructor-day")
                        .header("Authorization", "Bearer " + instructorToken)
                        .param("date", "2026-05-20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.instructorUserId").value(instructor.getId().toString()))
                .andExpect(jsonPath("$.totalSlots").value(1))
                .andExpect(jsonPath("$.totalBookings").value(1))
                .andExpect(jsonPath("$.slots[0].id").value(slot.getId().toString()))
                .andExpect(jsonPath("$.slots[0].bookings[0].studentName").value("Aluno Agregado"))
                .andExpect(jsonPath("$.slots[0].bookings[0].clinicalSummary.alerts[0]").value("Dor em acompanhamento"))
                .andExpect(jsonPath("$.slots[0].bookings[0].clinicalSummary.alerts[1]").value("Exige liberacao medica"))
                .andExpect(jsonPath("$.slots[0].bookings[0].clinicalSummary.generalObservations").value("Evitar carga axial intensa."))
                .andExpect(jsonPath("$.slots[0].bookings[0].clinicalSummary.latestProgressEntry.instructorNotes")
                        .value("Evolucao mais recente usada no resumo."))
                .andExpect(jsonPath("$.slots[0].bookings[0].clinicalSummary.latestProgressEntry.flexibilityScore").value(80))
                .andExpect(jsonPath("$.slots[0].bookings[0].clinicalSummary.latestProgressEntry.painLevel").value(1));
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
    void receptionCanCreateAndListScheduleBlocks() throws Exception {
        AppUser reception = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "recepcao.bloqueio@teste.local",
                "Recepcao Bloqueio",
                passwordEncoder.encode("Admin@12345"),
                UserRole.RECEPTION,
                true,
                java.util.Set.of()
        ));
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.bloqueio@teste.local",
                "Instrutor Bloqueio",
                passwordEncoder.encode("Admin@12345"),
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));

        String receptionToken = loginAndGetToken(reception.getEmail(), "Admin@12345");
        OffsetDateTime start = OffsetDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(2);

        String createBlockRequest = """
                {
                  "instructorUserId": "%s",
                  "startTime": "%s",
                  "endTime": "%s",
                  "reason": "Capacitacao interna"
                }
                """.formatted(instructor.getId(), start, end);

        mockMvc.perform(post("/api/v1/schedule-blocks")
                        .header("Authorization", "Bearer " + receptionToken)
                        .contentType(APPLICATION_JSON)
                        .content(createBlockRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.instructorName").value("Instrutor Bloqueio"))
                .andExpect(jsonPath("$.reason").value("Capacitacao interna"));

        mockMvc.perform(get("/api/v1/schedule-blocks")
                        .header("Authorization", "Bearer " + receptionToken)
                        .param("date", start.toLocalDate().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].instructorName").value("Instrutor Bloqueio"))
                .andExpect(jsonPath("$[0].reason").value("Capacitacao interna"));
    }

    @Test
    void receptionCanUpdateAndDeleteScheduleBlock() throws Exception {
        AppUser reception = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "recepcao.bloqueio.edicao@teste.local",
                "Recepcao Edicao",
                passwordEncoder.encode("Admin@12345"),
                UserRole.RECEPTION,
                true,
                java.util.Set.of()
        ));
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.bloqueio.edicao@teste.local",
                "Instrutor Edicao",
                passwordEncoder.encode("Admin@12345"),
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));

        String receptionToken = loginAndGetToken(reception.getEmail(), "Admin@12345");
        OffsetDateTime start = OffsetDateTime.now().plusDays(3).withHour(9).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(1);

        String createRequest = """
                {
                  "instructorUserId": "%s",
                  "startTime": "%s",
                  "endTime": "%s",
                  "reason": "Reuniao de equipe"
                }
                """.formatted(instructor.getId(), start, end);

        String createResponse = mockMvc.perform(post("/api/v1/schedule-blocks")
                        .header("Authorization", "Bearer " + receptionToken)
                        .contentType(APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID blockId = UUID.fromString(objectMapper.readTree(createResponse).get("id").asText());
        OffsetDateTime updatedStart = start.plusHours(2);
        OffsetDateTime updatedEnd = updatedStart.plusHours(1);
        String updateRequest = """
                {
                  "instructorUserId": "%s",
                  "startTime": "%s",
                  "endTime": "%s",
                  "reason": "Ajuste operacional"
                }
                """.formatted(instructor.getId(), updatedStart, updatedEnd);

        mockMvc.perform(put("/api/v1/schedule-blocks/{blockId}", blockId)
                        .header("Authorization", "Bearer " + receptionToken)
                        .contentType(APPLICATION_JSON)
                        .content(updateRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reason").value("Ajuste operacional"))
                .andExpect(jsonPath("$.startTime").value(updatedStart.toInstant().toString()));

        mockMvc.perform(delete("/api/v1/schedule-blocks/{blockId}", blockId)
                        .header("Authorization", "Bearer " + receptionToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/schedule-blocks")
                        .header("Authorization", "Bearer " + receptionToken)
                        .param("date", start.toLocalDate().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
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
    void receptionCanRemoveStudentFromWaitlist() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.fila@teste.local",
                "Instrutor Fila",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));
        Student bookedStudent = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Reservado",
                "11122233344",
                "reservado@teste.local",
                "85941112222",
                LocalDate.of(1990, 1, 1),
                StudentStatus.ACTIVE,
                true
        ));
        Student waitingStudent = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Fila",
                "22233344455",
                "fila@teste.local",
                "85942223333",
                LocalDate.of(1991, 1, 1),
                StudentStatus.ACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime start = OffsetDateTime.now().plusDays(1).withHour(16).withMinute(0).withSecond(0).withNano(0);
        UUID slotId = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_SOLO, start, start.plusHours(1), 1);
        createBooking(adminToken, slotId, bookedStudent.getId());

        String waitlistRequest = """
                {
                  "studentId": "%s"
                }
                """.formatted(waitingStudent.getId());

        String waitlistResponse = mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/waitlist", slotId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(waitlistRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("WAITING"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID waitlistEntryId = UUID.fromString(objectMapper.readTree(waitlistResponse).get("id").asText());

        mockMvc.perform(delete("/api/v1/schedule-slots/{slotId}/waitlist/{waitlistEntryId}", slotId, waitlistEntryId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"));

        mockMvc.perform(get("/api/v1/schedule-slots/{slotId}/waitlist", slotId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void receptionCanRescheduleBookingAndPromoteWaitlist() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "instrutor.remarca@teste.local",
                "Instrutor Remarcacao",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));
        Student studentToReschedule = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Remarcado",
                "33344455566",
                "remarcado@teste.local",
                "85943334444",
                LocalDate.of(1992, 2, 2),
                StudentStatus.ACTIVE,
                true
        ));
        Student waitlistStudent = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno Promovido Fila",
                "44455566677",
                "promovido@teste.local",
                "85944445555",
                LocalDate.of(1993, 3, 3),
                StudentStatus.ACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime start1 = OffsetDateTime.now().plusDays(2).withHour(9).withMinute(0).withSecond(0).withNano(0);
        UUID slot1 = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_SOLO, start1, start1.plusHours(1), 1);
        UUID bookingId = createBooking(adminToken, slot1, studentToReschedule.getId());

        OffsetDateTime start2 = OffsetDateTime.now().plusDays(2).withHour(11).withMinute(0).withSecond(0).withNano(0);
        UUID slot2 = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_SOLO, start2, start2.plusHours(1), 2);

        String waitlistRequest = """
                {
                  "studentId": "%s"
                }
                """.formatted(waitlistStudent.getId());

        mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/waitlist", slot1)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(waitlistRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("WAITING"));

        String rescheduleRequest = """
                {
                  "targetSlotId": "%s"
                }
                """.formatted(slot2);

        mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/bookings/{bookingId}/reschedule", slot1, bookingId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(rescheduleRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canceledBooking.status").value("CANCELED"))
                .andExpect(jsonPath("$.newBooking.status").value("BOOKED"))
                .andExpect(jsonPath("$.newBooking.studentId").value(studentToReschedule.getId().toString()));

        mockMvc.perform(get("/api/v1/schedule-slots/{slotId}/bookings", slot2)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentId").value(studentToReschedule.getId().toString()));

        mockMvc.perform(get("/api/v1/schedule-slots/{slotId}/bookings", slot1)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].studentId").value(waitlistStudent.getId().toString()));
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

    @Test
    void financialReportingSupportsDreCommissionAndDmed() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "financeiro.instrutor@teste.local",
                "Instrutor Financeiro",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_SOLO)
        ));
        Student student = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno DMED",
                "44455566677",
                "aluno.dmed@teste.local",
                "85940001122",
                LocalDate.of(1991, 4, 9),
                StudentStatus.ACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime start = OffsetDateTime.now().plusDays(2).withHour(8).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(1);
        UUID slotId = createScheduleSlot(adminToken, instructor.getId(), InstructorSpecialty.PILATES_SOLO, start, end, 2);
        createBooking(adminToken, slotId, student.getId());

        String commissionProfileRequest = """
                {
                  "instructorUserId": "%s",
                  "commissionModel": "PER_STUDENT_BOOKING",
                  "unitAmount": 30.00,
                  "active": true
                }
                """.formatted(instructor.getId());

        mockMvc.perform(post("/api/v1/financial/commissions/profiles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(commissionProfileRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.commissionModel").value("PER_STUDENT_BOOKING"))
                .andExpect(jsonPath("$.unitAmount").value(30.00));

        String planRequest = """
                {
                  "name": "Mensal Financeiro",
                  "priceAmount": 500.00,
                  "billingCycleMonths": 1
                }
                """;

        String planResponse = mockMvc.perform(post("/api/v1/billing/plans")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(planRequest))
                .andExpect(status().isCreated())
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
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID subscriptionId = UUID.fromString(objectMapper.readTree(subscriptionResponse).get("id").asText());

        String invoiceRequest = """
                {
                  "subscriptionId": "%s",
                  "dueDate": "%s"
                }
                """.formatted(subscriptionId, LocalDate.now().minusDays(1));

        String invoiceResponse = mockMvc.perform(post("/api/v1/billing/invoices/generate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(invoiceRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID invoiceId = UUID.fromString(objectMapper.readTree(invoiceResponse).get("id").asText());
        OffsetDateTime paidAt = OffsetDateTime.now().minusDays(1);

        String paymentRequest = """
                {
                  "amountPaid": 500.00,
                  "paymentMethod": "PIX",
                  "paidAt": "%s",
                  "externalReference": "DMED-PIX-001"
                }
                """.formatted(paidAt);

        mockMvc.perform(post("/api/v1/billing/invoices/{invoiceId}/payments", invoiceId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(paymentRequest))
                .andExpect(status().isCreated());

        String fixedExpenseRequest = """
                {
                  "description": "Aluguel",
                  "expenseType": "FIXED",
                  "amount": 200.00,
                  "occurredOn": "%s"
                }
                """.formatted(LocalDate.now().minusDays(1));

        String variableExpenseRequest = """
                {
                  "description": "Comissao instrutor",
                  "expenseType": "VARIABLE",
                  "amount": 30.00,
                  "occurredOn": "%s"
                }
                """.formatted(LocalDate.now().minusDays(1));

        mockMvc.perform(post("/api/v1/financial/expenses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(fixedExpenseRequest))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/financial/expenses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(variableExpenseRequest))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/financial/dre")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("startDate", LocalDate.now().minusDays(5).toString())
                        .param("endDate", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(500.00))
                .andExpect(jsonPath("$.totalFixedCosts").value(200.00))
                .andExpect(jsonPath("$.totalVariableCosts").value(30.00))
                .andExpect(jsonPath("$.netResult").value(270.00));

        mockMvc.perform(get("/api/v1/financial/commissions/reports")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("startDate", LocalDate.now().toString())
                        .param("endDate", LocalDate.now().plusDays(5).toString())
                        .param("instructorUserId", instructor.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].instructorName").value("Instrutor Financeiro"))
                .andExpect(jsonPath("$[0].quantity").value(1))
                .andExpect(jsonPath("$[0].totalAmount").value(30.00));

        int baseYear = paidAt.getYear();

        mockMvc.perform(get("/api/v1/financial/dmed/{baseYear}", baseYear)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providerCnpj").value("12345678000199"))
                .andExpect(jsonPath("$.students[0].cpf").value("44455566677"))
                .andExpect(jsonPath("$.students[0].totalPaid").value(500.00));

        String csvResponse = mockMvc.perform(get("/api/v1/financial/dmed/{baseYear}/csv", baseYear)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(csvResponse).contains("12345678000199");
        assertThat(csvResponse).contains("44455566677");
        assertThat(csvResponse).contains("500.00");
    }

    @Test
    void dashboardReturnsKpisForChurnOccupancyAndDelinquency() throws Exception {
        AppUser instructor = appUserRepository.save(new AppUser(
                UUID.randomUUID(),
                "dashboard.instrutor@teste.local",
                "Instrutor Dashboard",
                "$2a$10$FKnDJwN6CmxQ0VJ8A5yI0e1IY7PvxI6Bjq5lHppZArYrusS4x2M5K",
                UserRole.INSTRUCTOR,
                true,
                java.util.Set.of(InstructorSpecialty.PILATES_APARELHOS)
        ));
        Student activeStudent = studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno KPI Ativo",
                "55566677799",
                "ativo.kpi@teste.local",
                "85949998877",
                LocalDate.of(1990, 7, 10),
                StudentStatus.ACTIVE,
                true
        ));
        studentRepository.save(new Student(
                UUID.randomUUID(),
                "Aluno KPI Inativo",
                "66677788800",
                "inativo.kpi@teste.local",
                "85949998878",
                LocalDate.of(1989, 7, 10),
                StudentStatus.INACTIVE,
                true
        ));

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime slotStart = OffsetDateTime.now().plusDays(1).withHour(11).withMinute(0).withSecond(0).withNano(0);
        UUID slotId = createScheduleSlot(
                adminToken,
                instructor.getId(),
                InstructorSpecialty.PILATES_APARELHOS,
                slotStart,
                slotStart.plusHours(1),
                4
        );
        createBooking(adminToken, slotId, activeStudent.getId());

        String planRequest = """
                {
                  "name": "Plano KPI",
                  "priceAmount": 320.00,
                  "billingCycleMonths": 1
                }
                """;

        String planResponse = mockMvc.perform(post("/api/v1/billing/plans")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(planRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID planId = UUID.fromString(objectMapper.readTree(planResponse).get("id").asText());

        String subscriptionRequest = """
                {
                  "studentId": "%s",
                  "planId": "%s",
                  "startDate": "%s"
                }
                """.formatted(activeStudent.getId(), planId, LocalDate.now().minusDays(10));

        String subscriptionResponse = mockMvc.perform(post("/api/v1/billing/subscriptions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(subscriptionRequest))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID subscriptionId = UUID.fromString(objectMapper.readTree(subscriptionResponse).get("id").asText());

        mockMvc.perform(post("/api/v1/billing/invoices/generate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "subscriptionId": "%s",
                                  "dueDate": "%s"
                                }
                                """.formatted(subscriptionId, LocalDate.now().minusDays(1))))
                .andExpect(status().isCreated());

        String dashboardResponse = mockMvc.perform(get("/api/v1/dashboard/kpis")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("startDate", LocalDate.now().minusDays(2).toString())
                        .param("endDate", LocalDate.now().plusDays(2).toString()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode indicators = objectMapper.readTree(dashboardResponse).get("indicators");
        Map<String, Double> valuesByKey = new java.util.HashMap<>();
        for (JsonNode indicator : indicators) {
            valuesByKey.put(indicator.get("key").asText(), indicator.get("value").asDouble());
        }

        long activeCount = studentRepository.countByStatus(StudentStatus.ACTIVE);
        long inactiveCount = studentRepository.countByStatus(StudentStatus.INACTIVE);
        double expectedChurn = ((double) inactiveCount * 100.0) / (activeCount + inactiveCount);
        LocalDate rangeStart = LocalDate.now().minusDays(2);
        LocalDate rangeEnd = LocalDate.now().plusDays(2);
        OffsetDateTime occupancyStart = rangeStart.atStartOfDay().atOffset(slotStart.getOffset());
        OffsetDateTime occupancyEnd = rangeEnd.atTime(23, 59, 59).atOffset(slotStart.getOffset());
        var slotsInRange = scheduleSlotRepository.findAllByStartTimeBetweenOrderByStartTimeAsc(occupancyStart, occupancyEnd);
        int totalCapacity = slotsInRange.stream().mapToInt(slot -> slot.getCapacity()).sum();
        int totalBooked = slotsInRange.stream().mapToInt(slot -> slot.getBookedCount()).sum();
        double expectedOccupancy = totalCapacity == 0 ? 0.0d : round(((double) totalBooked * 100.0) / totalCapacity);
        var invoicesInRange = billingInvoiceRepository.findAllByDueDateBetweenOrderByDueDateAsc(rangeStart, rangeEnd);
        long overdueOpen = invoicesInRange.stream()
                .filter(invoice -> invoice.getStatus() == br.com.gerenciadorpilates.billing.domain.InvoiceStatus.OPEN)
                .count();
        double expectedDelinquency = invoicesInRange.isEmpty()
                ? 0.0d
                : round(((double) overdueOpen * 100.0) / invoicesInRange.size());

        assertThat(valuesByKey.get("churnRate")).isEqualTo(round(expectedChurn));
        assertThat(valuesByKey.get("occupancyRate")).isEqualTo(expectedOccupancy);
        assertThat(valuesByKey.get("delinquencyRate")).isEqualTo(expectedDelinquency);
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

    private double round(double value) {
        return java.math.BigDecimal.valueOf(value)
                .setScale(2, java.math.RoundingMode.HALF_UP)
                .doubleValue();
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponivel no ambiente atual.", exception);
        }
    }

    private String extractTextFromPdf(byte[] content) {
        try (PDDocument document = Loader.loadPDF(content)) {
            return new PDFTextStripper().getText(document);
        } catch (Exception exception) {
            throw new IllegalStateException("Falha ao ler o PDF gerado no teste.", exception);
        }
    }
}
