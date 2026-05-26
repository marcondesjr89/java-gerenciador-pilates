package br.com.gerenciadorpilates.students.api;

public record StudentSearchSummary(
        long totalStudents,
        long activeStudents,
        long inactiveStudents,
        long lgpdStudents
) {
}
