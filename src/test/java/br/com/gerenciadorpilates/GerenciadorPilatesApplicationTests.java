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
import br.com.gerenciadorpilates.identityaccess.domain.UserRole;
import br.com.gerenciadorpilates.identityaccess.infrastructure.AppUserRepository;
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
                true
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
                true
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

        String adminToken = loginAndGetToken("admin@test.local", "Admin@12345");
        OffsetDateTime startA = OffsetDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endA = startA.plusHours(1);
        OffsetDateTime startB = startA.plusHours(2);
        OffsetDateTime endB = startB.plusHours(1);

        UUID slotA = createScheduleSlot(adminToken, instructor.getId(), startA, endA, 1);
        UUID slotB = createScheduleSlot(adminToken, instructor.getId(), startB, endB, 1);
        UUID bookingId = createBooking(adminToken, slotA, student.getId());

        String rescheduleRequest = """
                {
                  "targetSlotId": "%s"
                }
                """.formatted(slotB);

        mockMvc.perform(post("/api/v1/schedule-slots/{slotId}/bookings/{bookingId}/self-service-reschedule", slotA, bookingId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(APPLICATION_JSON)
                        .content(rescheduleRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canceledBooking.status").value("CANCELED"))
                .andExpect(jsonPath("$.newBooking.slotId").value(slotB.toString()))
                .andExpect(jsonPath("$.newBooking.studentName").value("Julia Alves"));
    }

    private UUID createScheduleSlot(String token, UUID instructorId, OffsetDateTime start, OffsetDateTime end, int capacity)
            throws Exception {
        String request = """
                {
                  "instructorUserId": "%s",
                  "startTime": "%s",
                  "endTime": "%s",
                  "capacity": %d
                }
                """.formatted(instructorId, start, end, capacity);

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
}
