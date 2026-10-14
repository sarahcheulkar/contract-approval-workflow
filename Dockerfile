# =========================================================================
# Multi-Stage Dockerfile for Contract Approval Workflow
# Student: Shruti Gupta (Roll No: 23102C0051)
# =========================================================================

# Stage 1: Build the Application with Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source and build executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal, Secure Runtime Environment
FROM eclipse-temurin:17-jre-jammy
LABEL maintainer="Shruti Gupta <23102C0051@student.edu>"
LABEL description="Dockerized Contract Approval Workflow"

WORKDIR /app

# Create non-root system user for security
RUN groupadd -r appgroup && useradd -r -g appgroup -s /bin/false appuser

# Copy JAR from builder stage
COPY --from=builder /build/target/contract-approval-workflow-1.0.0.jar app.jar
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 8080

# Health check instruction for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
