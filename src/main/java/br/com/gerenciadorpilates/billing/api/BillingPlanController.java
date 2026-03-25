package br.com.gerenciadorpilates.billing.api;

import br.com.gerenciadorpilates.billing.application.BillingPlanService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/billing/plans")
public class BillingPlanController {

    private final BillingPlanService planService;

    public BillingPlanController(BillingPlanService planService) {
        this.planService = planService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BillingPlanResponse create(@Valid @RequestBody CreateBillingPlanRequest request) {
        return planService.create(request);
    }

    @GetMapping
    public List<BillingPlanResponse> list() {
        return planService.list();
    }
}
