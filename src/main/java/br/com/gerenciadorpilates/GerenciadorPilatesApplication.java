package br.com.gerenciadorpilates;

import br.com.gerenciadorpilates.identityaccess.application.AdminBootstrapProperties;
import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import br.com.gerenciadorpilates.platform.security.JwtProperties;
import br.com.gerenciadorpilates.platform.storage.ClinicalAttachmentStorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        ApplicationProperties.class,
        JwtProperties.class,
        AdminBootstrapProperties.class,
        ClinicalAttachmentStorageProperties.class
})
public class GerenciadorPilatesApplication {

    public static void main(String[] args) {
        SpringApplication.run(GerenciadorPilatesApplication.class, args);
    }
}
