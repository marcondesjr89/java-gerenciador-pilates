package br.com.gerenciadorpilates.platform.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Component;

@Primary
@Component
public class LocalClinicalAttachmentStorage implements ClinicalAttachmentStorage {

    private final Path rootPath;

    public LocalClinicalAttachmentStorage(ClinicalAttachmentStorageProperties properties) throws IOException {
        this.rootPath = Path.of(properties.localRoot()).toAbsolutePath().normalize();
        Files.createDirectories(rootPath);
    }

    @Override
    public StoredFile save(String storageKey, String contentType, InputStream content) throws IOException {
        Path destination = rootPath.resolve(storageKey).normalize();
        Files.createDirectories(destination.getParent());
        Files.copy(content, destination, StandardCopyOption.REPLACE_EXISTING);
        long size = Files.size(destination);
        return new StoredFile(storageKey, contentType, size, new FileSystemResource(destination));
    }

    @Override
    public StoredFile load(String storageKey, String contentType, long size) {
        Path filePath = rootPath.resolve(storageKey).normalize();
        return new StoredFile(storageKey, contentType, size, new FileSystemResource(filePath));
    }
}
