package com.contractflow.service;

import com.contractflow.model.Contract;
import com.contractflow.model.ContractStatus;
import com.contractflow.model.WorkflowStage;
import com.contractflow.repository.ContractRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit & Integration Tests for Contract Approval Service
 * Student: Shruti Gupta (Roll No: 23102C0051)
 */
@SpringBootTest
public class ContractServiceTest {

    @Autowired
    private ContractService contractService;

    @Autowired
    private ContractRepository contractRepository;

    @BeforeEach
    public void setup() {
        contractRepository.deleteAll();
    }

    @Test
    @DisplayName("Unit Test: Successfully create contract with valid payload")
    public void testCreateContractSuccess() {
        Contract contract = new Contract();
        contract.setTitle("Cloud Infrastructure SLA");
        contract.setVendor("Amazon Web Services");
        contract.setCategory("Service Level Agreement");
        contract.setAmount(150000.0);
        contract.setDueDate("2026-12-31");

        Contract saved = contractService.createContract(contract);

        assertNotNull(saved.getId(), "Generated ID should not be null");
        assertNotNull(saved.getContractId(), "Contract ID should be formatted");
        assertEquals(ContractStatus.SUBMITTED, saved.getStatus());
        assertEquals(WorkflowStage.INITIATION, saved.getStage());
        assertEquals(150000.0, saved.getAmount());
    }

    @Test
    @DisplayName("Unit Test: Creation rejected when amount <= 0 (Quality Gate)")
    public void testCreateContractZeroAmountThrowsException() {
        Contract contract = new Contract();
        contract.setTitle("Invalid Contract");
        contract.setVendor("Vendor X");
        contract.setAmount(0.0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            contractService.createContract(contract);
        });

        assertTrue(ex.getMessage().contains("greater than zero"));
    }

    @Test
    @DisplayName("Unit Test: Creation rejected when title is missing")
    public void testCreateContractMissingTitleThrowsException() {
        Contract contract = new Contract();
        contract.setVendor("Vendor X");
        contract.setAmount(5000.0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            contractService.createContract(contract);
        });

        assertTrue(ex.getMessage().contains("title is required"));
    }

    @Test
    @DisplayName("Unit Test: Transition to APPROVED status with remarks")
    public void testApproveContract() {
        Contract contract = new Contract();
        contract.setTitle("Security Audit 2026");
        contract.setVendor("Palo Alto Networks");
        contract.setCategory("Security");
        contract.setAmount(80000.0);
        contract.setDueDate("2026-11-30");
        Contract saved = contractService.createContract(contract);

        Contract approved = contractService.approveContract(saved.getId(), "Budget and compliance verified.", "Shruti Gupta");

        assertEquals(ContractStatus.APPROVED, approved.getStatus());
        assertEquals(WorkflowStage.EXECUTION, approved.getStage());
        assertEquals("Budget and compliance verified.", approved.getReviewerNotes());
        assertEquals("Shruti Gupta", approved.getReviewedBy());
    }

    @Test
    @DisplayName("Unit Test: Transition to REJECTED status with rejection reason")
    public void testRejectContract() {
        Contract contract = new Contract();
        contract.setTitle("Hardware Refresh");
        contract.setVendor("Dell EMC");
        contract.setCategory("Hardware");
        contract.setAmount(250000.0);
        contract.setDueDate("2026-10-31");
        Contract saved = contractService.createContract(contract);

        Contract rejected = contractService.rejectContract(saved.getId(), "Exceeds fiscal quarterly budget cap.", "Shruti Gupta");

        assertEquals(ContractStatus.REJECTED, rejected.getStatus());
        assertEquals(WorkflowStage.REVIEW, rejected.getStage());
        assertEquals("Exceeds fiscal quarterly budget cap.", rejected.getReviewerNotes());
        assertEquals("Shruti Gupta", rejected.getReviewedBy());
    }

    @Test
    @DisplayName("Unit Test: Aggregated KPI metrics calculation")
    public void testMetricsCalculation() {
        Contract c1 = new Contract();
        c1.setTitle("C1");
        c1.setVendor("V1");
        c1.setCategory("Software License");
        c1.setAmount(1000.0);
        contractService.createContract(c1);

        Map<String, Object> metrics = contractService.getMetrics();
        assertNotNull(metrics);
        assertTrue((Long) metrics.get("total") >= 1);
    }
}
