pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['QA', 'STAGING', 'PRODUCTION'], description: 'Deployment Target Environment')
        string(name: 'DOCKER_IMAGE_NAME', defaultValue: 'shrutigupta/contract-workflow', description: 'Docker Hub Image Repository')
    }

    environment {
        APP_VERSION = '1.0.0'
        IMAGE_TAG = "${params.DOCKER_IMAGE_NAME}:${APP_VERSION}-${BUILD_NUMBER}"
        LATEST_TAG = "${params.DOCKER_IMAGE_NAME}:latest"
        APP_PORT = '8080'
    }

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "==> Fetching source code from Git repository for Shruti Gupta (23102C0051)..."
                checkout scm
            }
        }

        stage('Compile & Static Analysis') {
            steps {
                echo "==> Compiling Java sources with Maven..."
                sh 'mvn clean compile'
            }
        }

        stage('Unit Testing') {
            steps {
                echo "==> Executing Spring Boot Context & Unit Tests..."
                sh 'mvn test'
            }
            post {
                always {
                    junit testResults: 'target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Package Artifact') {
            steps {
                echo "==> Packaging Spring Boot executable JAR..."
                sh 'mvn package -DskipTests'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo "==> Archiving build artifact target/contract-approval-workflow-1.0.0.jar..."
                archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
            }
        }

        stage('Selenium E2E Continuous Testing (Quality Gate)') {
            steps {
                echo "==> Starting Contract Approval Web Portal in background for Selenium tests..."
                sh '''
                    nohup java -jar target/contract-approval-workflow-1.0.0.jar > app-test.log 2>&1 &
                    echo $! > app.pid
                    sleep 12
                    curl -f http://localhost:8080/api/health || (echo "App failed to start" && exit 1)
                '''

                echo "==> Executing Selenium E2E Journeys with failure screenshot mechanism..."
                sh 'mvn test -Dtest=ContractWorkflowSeleniumTest'
            }
            post {
                always {
                    // Kill test server process
                    sh 'if [ -f app.pid ]; then kill $(cat app.pid) || true; rm -f app.pid; fi'
                    // Publish test reports and archive failure screenshots
                    junit testResults: 'target/surefire-reports/*SeleniumTest*.xml', allowEmptyResults: true
                    archiveArtifacts artifacts: 'target/screenshots/*.png', allowEmptyResults: true
                }
            }
        }

        stage('Docker Build & Tag') {
            steps {
                echo "==> Building versioned Docker Image: ${IMAGE_TAG}..."
                sh "docker build -t ${IMAGE_TAG} -t ${LATEST_TAG} ."
            }
        }

        stage('Docker Registry Publish') {
            steps {
                // When Docker Hub credentials are configured in Jenkins:
                // withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                //     sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                //     sh "docker push ${IMAGE_TAG}"
                //     sh "docker push ${LATEST_TAG}"
                // }
                echo "==> Docker image ${IMAGE_TAG} tagged and ready for push."
            }
        }

        stage('Continuous Deployment (Container Run)') {
            steps {
                echo "==> Deploying fresh container to ${params.ENVIRONMENT} environment..."
                sh """
                    docker stop contract-workflow-container || true
                    docker rm contract-workflow-container || true
                    docker run -d --name contract-workflow-container -p ${APP_PORT}:8080 ${IMAGE_TAG}
                """

                echo "==> Performing Health Check on deployed container..."
                sh """
                    sleep 15
                    curl -f http://localhost:${APP_PORT}/actuator/health || (echo "Health check failed!" && exit 1)
                """
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Pipeline completed! Contract Approval Workflow deployed to ${params.ENVIRONMENT}."
        }
        failure {
            echo "FAILURE: Quality Gate or Deployment failed. Halting pipeline to prevent broken releases."
        }
    }
}
