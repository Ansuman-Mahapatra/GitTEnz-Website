$envFile = "backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value)
            Write-Host "Loaded $key"
        }
    }
} else {
    Write-Host ".env file not found!"
}

java -DFRONTEND_URL=http://localhost:5180 -jar backend/target/backend-0.0.1-SNAPSHOT.jar
