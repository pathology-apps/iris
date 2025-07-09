def remote = [:]

def updateGitConfig() {
    sh "git config user.email path-appdev@med.umich.edu"
    sh "git config user.name Jenkins"
    sh 'git config --global --add safe.directory $(pwd)'
}

def gitCommitAndPush(String commitMsg) {
    try {
        sh """
            git add .
            git commit -m "${commitMsg}"
            git push origin main
        """
    } catch (Exception e) {
        error "Git operation failed: ${e.message}"
    }
}

def updateManifest(String version) {
    def overlayFolder = 'dev'
    def manifestPath = "overlays/${overlayFolder}/kustomization.yml"
    def app = readYaml file: manifestPath
    app.images[0].newTag = version
    app.images[1].newTag = version
    app.images[2].newTag = version
    app.images[3].newTag = version
    writeYaml(file: manifestPath, overwrite: true, data: app)
}

pipeline {
    agent {
        node {
            label "${env.AGENT_NODE}"
        }
    }

    options {
        ansiColor('xterm')
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('b5dda031-b975-4cf8-9f76-747484efa6fe')
        REGISTRY_CREDENTIALS = '7d865517-f930-40e6-a4a7-aaf62dea26fd'
    }

    stages {

        stage('Set Git Config') {
            steps {
                script {
                    updateGitConfig()
                }
            }
        }

        stage('Get Git Commit Hash') {
            steps {
                script {
                    env.GIT_COMMIT_HASH = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    echo "Git Commit Hash: ${env.GIT_COMMIT_HASH}"
                }
            }
        }

        stage('Building Docker Image') {
            steps {
                updateGitlabCommitStatus name: 'create images', state: 'pending'
                script {
                    //Create PHP image
                    docker.withRegistry('https://path-portus.med.umich.edu', '8fcc119c-67df-4293-b7ae-d08fa3e528ea') {
                        def go = docker.build("apps/vsb-go/go", "--pull --progress=plain --no-cache --build-arg WWW_DATA_ID=${env.ENV_WWW_DATA_ID} -f ./docker/go/Dockerfile.prod .")
                        go.push("${env.ENV_BRANCH_NAME}")
                        go.push("${env.GIT_COMMIT_HASH}")
                        go.push("latest")

                        def nginx = docker.build("apps/vsb-go/nginx", "--pull --progress=plain --no-cache -f ./docker/nginx/nginx.Dockerfile .")
                        nginx.push("${env.ENV_BRANCH_NAME}")
                        nginx.push("${env.GIT_COMMIT_HASH}")
                        nginx.push("latest")

                        def iipsrv = docker.build("apps/vsb-go/iipsrv", "--pull --progress=plain -f ./docker/iipsrv/iipsrv.Dockerfile .")
                        iipsrv.push("${env.ENV_BRANCH_NAME}")
                        iipsrv.push("${env.GIT_COMMIT_HASH}")
                        iipsrv.push("latest")

                        // def redis = docker.build("apps/vsb/redis", "--pull --progress=plain -f ./dockerfiles/redis.Dockerfile .")
                        // redis.push("${env.ENV_BRANCH_NAME}")
                        // redis.push("${env.GIT_COMMIT_HASH}")
                        // redis.push("latest")
                    }
                }
                updateGitlabCommitStatus name: 'create images', state: 'success'
            }
        }

        stage('Clone configuration project') {
            steps { 
                withCredentials([string(credentialsId: '631565a5-7582-40cd-a98d-a9091718b37e', variable: 'GIT_TOKEN')]) {
                    sh """
                        git clone https://x-token-auth:${GIT_TOKEN}@git.umms.med.umich.edu/pathinfo/gitops/vsb-go-config.git
                        cd vsb-go-config
                        git checkout main
                    """
                }
            }
        }
        
        stage('Update kustomization manifest') {
            steps {
                dir('vsb-go-config') {
                    script {
                        updateGitConfig()
                        updateManifest(env.GIT_COMMIT_HASH)
                        gitCommitAndPush("Version updated by Jenkins job #${env.BUILD_NUMBER}")
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
