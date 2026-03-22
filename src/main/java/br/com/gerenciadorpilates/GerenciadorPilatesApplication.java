package br.com.gerenciadorpilates;

import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ApplicationProperties.class)
public class GerenciadorPilatesApplication {

    public static void main(String[] args) {
        SpringApplication.run(GerenciadorPilatesApplication.class, args);
    }
}
