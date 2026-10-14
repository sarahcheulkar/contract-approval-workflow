package com.contractflow.controller;

import com.contractflow.model.Contract;
import com.contractflow.model.ContractStatus;
import com.contractflow.model.WorkflowStage;
import com.contractflow.service.ContractService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ContractApiController {

    private final ContractService contractService;

    public ContractApiController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<Contract>> listContracts(
            @RequestParam(required = false) WorkflowStage stage,
            @RequestParam(required = false) ContractStatus status) {
        if (stage != null) {
            return ResponseEntity.ok(contractService.getContractsByStage(stage));
        }
        if (status != null) {
            return ResponseEntity.ok(contractService.getContractsByStatus(status));
        }
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/contracts/{id}")
    public ResponseEntity<?> getContract(@PathVariable Long id) {
        return contractService.getContractById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/contracts")
    public ResponseEntity<?> createContract(@Valid @RequestBody Contract contract) {
        try {
            Contract saved = contractService.createContract(contract);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/contracts/{id}/approve")
    public ResponseEntity<?> approveContract(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("reviewerNotes") : null;
        String reviewer = body != null ? body.get("reviewerName") : null;
        try {
            Contract updated = contractService.approveContract(id, notes, reviewer);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/contracts/{id}/reject")
    public ResponseEntity<?> rejectContract(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("reviewerNotes") : null;
        String reviewer = body != null ? body.get("reviewerName") : null;
        try {
            Contract updated = contractService.rejectContract(id, notes, reviewer);
            return ResponseEntity.ok(updated);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/contracts/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(contractService.getMetrics());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Contract Approval Workflow");
        health.put("student", "Shruti Gupta (Roll No: 23102C0051)");
        health.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(health);
    }
}
