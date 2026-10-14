package com.contractflow.model;

/**
 * The 8-stage lifecycle representing contract evolution from inception to archival.
 */
public enum WorkflowStage {
    INITIATION("Initiation", 1),
    REVIEW("Review", 2),
    APPROVAL("Approval", 3),
    EXECUTION("Execution", 4),
    ANALYTICS("Analytics", 5),
    RENEWAL("Renewal", 6),
    EXPIRY("Expiry", 7),
    ARCHIVED("Archived", 8);

    private final String displayName;
    private final int stageNumber;

    WorkflowStage(String displayName, int stageNumber) {
        this.displayName = displayName;
        this.stageNumber = stageNumber;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getStageNumber() {
        return stageNumber;
    }
}
