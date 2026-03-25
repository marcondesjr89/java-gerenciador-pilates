package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.application.BillingInvoiceService;
import br.com.gerenciadorpilates.billing.application.BillingPaymentService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/invoices")
public class BillingInvoiceController {

    private final BillingInvoiceService invoiceService;
    private final BillingPaymentService paymentService;

    public BillingInvoiceController(BillingInvoiceService invoiceService, BillingPaymentService paymentService) {
        this.invoiceService = invoiceService;
        this.paymentService = paymentService;
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public BillingInvoiceResponse generate(@Valid @RequestBody GenerateInvoiceRequest request) {
        return invoiceService.generate(request);
    }

    @GetMapping("/overdue")
    public List<BillingInvoiceResponse> listOverdue(
            @RequestParam(value = "baseDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baseDate
    ) {
        return invoiceService.listOverdue(baseDate);
    }

    @GetMapping("/student/{studentId}")
    public List<BillingInvoiceResponse> listByStudent(@PathVariable UUID studentId) {
        return invoiceService.listByStudent(studentId);
    }

    @PostMapping("/{invoiceId}/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public BillingPaymentResponse registerPayment(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody RegisterPaymentRequest request
    ) {
        return paymentService.register(invoiceId, request);
    }
}
