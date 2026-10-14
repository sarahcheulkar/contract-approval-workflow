package com.contractflow.model;

/**
 * Functional approval statuses for a contract request.
 */
public enum ContractStatus {
    SUBMITTED("Submitted", "#F59E0B"),
    UNDER_REVIEW("Under Review", "#6366F1"),
    APPROVED("Approved", "#10B981"),
    REJECTED("Rejected", "#EF4444");

    private final String label;
    private final String colorCode;

    ContractStatus(String label, String colorCode) {
        this.label = label;
        this.colorCode = colorCode;
    }

    public String getLabel() {
        return label;
    }

    public String getColorCode() {
        return colorCode;
    }
}
