package br.com.gerenciadorpilates.students.api;

import java.util.List;

public record StudentSearchResponse(
        List<StudentResponse> items,
        long totalElements,
        int totalPages,
        int page,
        int size,
        StudentSearchSummary summary
) {
}
