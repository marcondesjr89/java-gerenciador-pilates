package br.com.gerenciadorpilates.students.application;

import java.util.List;
import java.util.UUID;

public interface StudentActiveObligationsPort {

    List<String> getBlockingReasons(UUID studentId);
}
