package br.com.gerenciadorpilates.platform.storage;

import org.springframework.core.io.Resource;

public record StoredFile(
        String storageKey,
        String contentType,
        long size,
        Resource resource
) {
}
