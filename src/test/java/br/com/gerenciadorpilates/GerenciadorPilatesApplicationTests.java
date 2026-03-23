package br.com.gerenciadorpilates;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.gerenciadorpilates.clinical.domain.StudentProgressEntry;
import br.com.gerenciadorpilates.clinical.infrastructure.StudentProgressEntryRepository;
import br.com.gerenciadorpilates.identityaccess.domain.AppUser;
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
