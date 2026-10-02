package br.com.gerenciadorpilates.platform.api;

import br.com.gerenciadorpilates.platform.config.ApplicationProperties;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.TimeUnit;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemInfoController {

    private final ApplicationProperties properties;

    public SystemInfoController(ApplicationProperties properties) {
        this.properties = properties;
    }

    @GetMapping("/info")
    public ResponseEntity<SystemInfoResponse> info() {
        ZonedDateTime now = Instant.now().atZone(ZoneId.of(properties.timezone()));
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS).cachePublic())
                .body(new SystemInfoResponse(properties.name(), properties.timezone(), now));
    }

    public record SystemInfoResponse(String applicationName, String timezone, ZonedDateTime currentTime) {
    }
}
