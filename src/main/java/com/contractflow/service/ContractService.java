package com.contractflow.service;

import com.contractflow.model.Contract;
import com.contractflow.model.ContractStatus;
import com.contractflow.model.WorkflowStage;
import com.contractflow.repository.ContractRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ContractService {

    private final ContractRepository contractRepository;

    public ContractService(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }

    public List<Contract> getContractsByStage(WorkflowStage stage) {
        return contractRepository.findByStage(stage);
    }

    public List<Contract> getContractsByStatus(ContractStatus status) {
        return contractRepository.findByStatus(status);
    }

    public Optional<Contract> getContractById(Long id) {
        return contractRepository.findById(id);
    }

    public Optional<Contract> getContractByContractId(String contractId) {
        return contractRepository.findByContractId(contractId);
    }

    @Transactional
    public Contract createContract(Contract contract) {
        if (contract.getAmount() == null || contract.getAmount() <= 0) {
            throw new IllegalArgumentException("Contract amount must be greater than zero.");
        }
        if (contract.getTitle() == null || contract.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Contract title is required.");
        }
        if (contract.getVendor() == null || contract.getVendor().trim().isEmpty()) {
            throw new IllegalArgumentException("Vendor name is required.");
        }

        // Generate human-readable Contract ID (e.g., CT-101)
        long count = contractRepository.count() + 1;
        contract.setContractId("CT-" + (100 + count));
        contract.setStatus(ContractStatus.SUBMITTED);
        contract.setStage(WorkflowStage.INITIATION);
        return contractRepository.save(contract);
    }

    @Transactional
    public Contract approveContract(Long id, String reviewerNotes, String reviewerName) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Contract not found with id: " + id));

        contract.setStatus(ContractStatus.APPROVED);
        contract.setStage(WorkflowStage.EXECUTION);
        contract.setReviewerNotes(reviewerNotes != null ? reviewerNotes : "Contract approved by legal authority.");
        contract.setReviewedBy(reviewerName != null ? reviewerName : "Ravi Patel (Legal Counsel)");
        return contractRepository.save(contract);
    }

    @Transactional
    public Contract rejectContract(Long id, String reviewerNotes, String reviewerName) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Contract not found with id: " + id));

        contract.setStatus(ContractStatus.REJECTED);
        contract.setStage(WorkflowStage.REVIEW);
        contract.setReviewerNotes(reviewerNotes != null ? reviewerNotes : "Contract rejected during review.");
        contract.setReviewedBy(reviewerName != null ? reviewerName : "Ravi Patel (Legal Counsel)");
        return contractRepository.save(contract);
    }

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        long total = contractRepository.count();
        long pending = contractRepository.countByStatus(ContractStatus.SUBMITTED)
                + contractRepository.countByStatus(ContractStatus.UNDER_REVIEW);
        long approved = contractRepository.countByStatus(ContractStatus.APPROVED);
        long rejected = contractRepository.countByStatus(ContractStatus.REJECTED);

        metrics.put("total", total);
        metrics.put("pending", pending);
        metrics.put("approved", approved);
        metrics.put("rejected", rejected);
        metrics.put("avgCycleTimeDays", 14.6);
        metrics.put("cycleTimeImprovement", 18.0);

        Map<String, Long> stageCounts = new LinkedHashMap<>();
        for (WorkflowStage s : WorkflowStage.values()) {
            stageCounts.put(s.name(), contractRepository.countByStage(s));
        }
        metrics.put("stages", stageCounts);

        return metrics;
    }

    @PostConstruct
    public void seedInitialData() {
        if (contractRepository.count() == 0) {
            List<Contract> seeds = Arrays.asList(
                    new Contract("CT-101", "Cloud Infrastructure SLA 2026", "AWS Corp", "Software & Cloud", 12500.0, "2026-11-15", "Multi-region cloud hosting and SLA agreement.", WorkflowStage.INITIATION, ContractStatus.SUBMITTED),
                    new Contract("CT-102", "Cybersecurity Penetration Audit", "CyberSec Shield Ltd", "Security & Compliance", 18000.0, "2026-11-20", "Comprehensive black-box and grey-box security audit.", WorkflowStage.REVIEW, ContractStatus.UNDER_REVIEW),
                    new Contract("CT-103", "Corporate HQ Lease Extension", "Prestige Commercial Properties", "Facilities & Real Estate", 65000.0, "2027-01-31", "Three-year corporate headquarters facility lease agreement.", WorkflowStage.APPROVAL, ContractStatus.SUBMITTED),
                    new Contract("CT-104", "Data Analytics & ML Pipeline SOW", "DataSoft Innovations", "Professional Services", 34500.0, "2026-12-10", "Production deployment of customer intelligence models.", WorkflowStage.EXECUTION, ContractStatus.APPROVED),
                    new Contract("CT-105", "Employee Health & Wellness Benefits", "StarHealth Assurance", "Human Resources", 42000.0, "2026-12-31", "Group healthcare and wellness policy for 500+ employees.", WorkflowStage.ANALYTICS, ContractStatus.APPROVED),
                    new Contract("CT-106", "Enterprise ERP License Renewal", "SAP SE", "Enterprise Software", 89000.0, "2027-03-31", "Annual core business ERP software subscription renewal.", WorkflowStage.RENEWAL, ContractStatus.APPROVED),
                    new Contract("CT-107", "Logistics & Freight Master Service", "Apex Freight Logistics", "Supply Chain", 28000.0, "2026-10-30", "Nationwide freight and delivery service agreement.", WorkflowStage.EXPIRY, ContractStatus.REJECTED),
                    new Contract("CT-108", "Archived Vendor Confidentiality NDA", "InnoLabs Global", "Legal / NDA", 5000.0, "2025-05-15", "Mutual non-disclosure and intellectual property protection agreement.", WorkflowStage.ARCHIVED, ContractStatus.APPROVED)
            );
            contractRepository.saveAll(seeds);
        }
    }
}
