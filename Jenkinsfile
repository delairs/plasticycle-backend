pipeline {

    agent any

    environment {
        gitUrl = 'https://github.com/delairs/plasticycle-backend.git'
        gitBranch = 'master'
        appsName = 'plasticycle-backend'
        registry = "delairs/$appsName"
        dockerCred = credentials('dockerCred')
        kubeConfig = credentials('kubeConfig')
        bitbucket_cred = credentials('bitbucket_cred')
    }

    // JIKA MENGGUNAKAN NODE NYALAKAN COMMENT
    tools {nodejs "node2212"}

    stages{
        stage('Clone Repository') {
            steps {
                dir ('sourcecode') {
                    // Perintah 'git' akan meng-clone repository
                    // ke dalam workspace Jenkins
                    git url: gitUrl, 
                    branch: gitBranch

                    echo "Clone selesai."

                    // Opsional: verifikasi isi folder
                    sh 'ls -la'
                }
            }
        }

        stage('Build and Test') {
            steps {
                dir('sourcecode'){
                    sh 'npm install'
                    sh 'ls -la'
                    // sh 'composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev'
                    // sh 'mkdir -p storage/logs storage/framework/views bootstrap/cache'
                    // sh 'touch storage/logs/laravel.log'
                    // sh 'chmod -R 775 storage bootstrap/cache'     
                }
            }
        }

        // // SCAN SNYK
        // stage('Snyk - Full Dependency Scan') {
        //     steps {
        //         script {
        //             try {
        //                 dir('sourcecode') {
        //                     snykSecurity(
        //                       snykInstallation: 'Snyk',
        //                       snykTokenId: 'snykToken',
        //                       severity: 'low',
        //                       targetFile: 'package-lock.json',
        //                       projectName: '$appsName',
        //                       additionalArguments: '''
        //                         --dev
        //                         --strict-out-of-sync=true
        //                         --show-vulnerable-paths=all
        //                         --policy-path=.snyk
        //                       '''.trim()
        //                     )

        //                     env.stageResultsnyk = 'true'
        //                 }
        //             } catch (Exception e) {
        //                 unstable("${STAGE_NAME} failed!")
        //                 env.stageResultsnyk = 'false'
        //             }
        //         }
        //     }
        // }

        // // SEMGREP SCAN
        // stage('Run Semgrep Scan') {
        //     steps {
        //         script {
        //             try {
        //                 dir ('sourcecode') {
        //                     sh 'semgrep scan --config auto --json --output semgrep-report.json'

        //                     archiveArtifacts artifacts: 'semgrep-report.json', fingerprint: true

        //                     def semgrepReport = readJSON file: 'semgrep-report.json'
        //                     def findings = semgrepReport.results?.size() ?: 0

        //                     if (findings > 0) {
        //                         echo "Semgrep found ${findings} findings"
        //                         env.stageResultsemgrep = 'false'
        //                         unstable("Semgrep found ${findings} findings")
        //                     } else {
        //                         env.stageResultsemgrep = 'true'
        //                         echo "Semgrep clean"
        //                     }
        //                 }
        //             } catch (Exception e) {
        //                 echo "Semgrep error: ${e.getMessage()}"
        //                 env.stageResultsemgrep = 'false'
        //                 unstable("Semgrep scan failed")
        //             }
        //         }
        //     }
        // }  

        //BUILD
        stage('Build Docker Image') {
            steps { 
                dir ('sourcecode') {
                    echo "Mulai membuat Docker image..."
                    sh "docker build -t ${registry}:${BUILD_NUMBER} ."
                }
            }
        }

        //PUSH TO DOCKER HUB
        stage('Push to Docker Hub') {
            steps {
                script {
                    dir ('sourcecode') {
                        withCredentials([usernamePassword(credentialsId: 'dockerCred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh """
                                echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin
                                docker push ${registry}:${BUILD_NUMBER}
                            """
                        }
                    }
                }
            }
        }

        //DEPLOY
        stage('Deploy to Kubernetes') {
            // when {
            //     expression {
            //         env.stageResultsnyk == 'true' && env.stageResultsemgrep == 'true'
            //     }
            // }
            steps {
                script {
                    try {
                        dir ('sourcecode') {
                            sh "sed -i 's/latest/$env.BUILD_NUMBER/g' deployment.yaml"
                            sh "kubectl --kubeconfig=$kubeConfig apply --validate=false -f backend-deployment.yaml -n prod"
                            sh "kubectl --kubeconfig=$kubeConfig rollout status deployment ${appsName} -n prod --timeout=300s"
                        }
                    } catch (Exception e) {
                        throw e
                    }
                }
            }
        }
    }
    post {
        always {
            sh '''
              echo "Cleaning up images for ${registry}..."
              imgs=$(docker images ${registry} --format "{{.Repository}}:{{.Tag}}")
              if [ -z "$imgs" ]; then
                echo "No images found for ${registry}"
              else
                echo "$imgs" | xargs docker rmi
              fi
            '''
            deleteDir()
        }
        success {
            echo "Release Success"
        }
        failure {
            echo "Release Failed"
        }
        cleanup {
            echo "Clean up in post work space"
            cleanWs()
        }
    }
}