package br.com.gerenciadorpilates.platform.storage;

import java.io.IOException;
import java.io.InputStream;

public interface ClinicalAttachmentStorage {

    StoredFile save(String storageKey, String contentType, InputStream content) throws IOException;

    StoredFile load(String storageKey, String contentType, long size) throws IOException;
}
