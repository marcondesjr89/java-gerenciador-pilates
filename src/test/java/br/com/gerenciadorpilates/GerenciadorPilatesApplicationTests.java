package br.com.gerenciadorpilates;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.gerenciadorpilates.platform.api.SystemInfoController.SystemInfoResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GerenciadorPilatesApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private br.com.gerenciadorpilates.platform.api.SystemInfoController controller;

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
}
