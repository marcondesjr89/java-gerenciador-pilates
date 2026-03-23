package br.com.gerenciadorpilates.platform.storage;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.storage.clinical-attachments")
public record ClinicalAttachmentStorageProperties(
        @NotBlank String localRoot,
        @Min(1) long maxFileSizeBytes,
        List<String> allowedContentTypes
) {
}
