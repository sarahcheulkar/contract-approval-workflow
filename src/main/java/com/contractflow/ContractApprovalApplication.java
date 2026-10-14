package com.contractflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ContractApprovalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContractApprovalApplication.class, args);
        System.out.println("=========================================================");
        System.out.println(" CONTRACT APPROVAL WORKFLOW PORTAL STARTED SUCCESSFULLY ");
        System.out.println(" Student: Shruti Gupta | Roll No: 23102C0051                 ");
        System.out.println(" Web UI:       http://localhost:8080                    ");
        System.out.println(" Health Check: http://localhost:8080/actuator/health    ");
        System.out.println(" REST API:     http://localhost:8080/api/contracts      ");
        System.out.println("=========================================================");
    }
}
