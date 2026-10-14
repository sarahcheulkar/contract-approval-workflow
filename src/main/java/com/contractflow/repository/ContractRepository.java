package com.contractflow.repository;

import com.contractflow.model.Contract;
import com.contractflow.model.ContractStatus;
import com.contractflow.model.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    Optional<Contract> findByContractId(String contractId);

    List<Contract> findByStage(WorkflowStage stage);

    List<Contract> findByStatus(ContractStatus status);

    long countByStatus(ContractStatus status);

    long countByStage(WorkflowStage stage);
}
