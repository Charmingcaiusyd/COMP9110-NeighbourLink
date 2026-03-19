$ErrorActionPreference = "Stop"

function Assert-Command {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$InstallHint
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command '$Name'. $InstallHint"
  }
}

function Test-HttpReady {
  param([Parameter(Mandatory = $true)][string]$Url)

  try {
    $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
  } catch {
    return $false
  }
}

function Wait-ForHttpReady {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][int]$TimeoutSeconds
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-HttpReady -Url $Url) {
      Write-Host "[OK] $Name is ready: $Url"
      return
    }
    Start-Sleep -Seconds 2
  }

  throw "$Name failed to become ready within $TimeoutSeconds seconds. Check logs in .run/logs."
}

function Read-PidIfRunning {
  param([Parameter(Mandatory = $true)][string]$PidFile)

  if (-not (Test-Path $PidFile)) {
    return $null
  }

  $rawPid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if (-not $rawPid) {
    Remove-Item $PidFile -ErrorAction SilentlyContinue
    return $null
  }

  $proc = Get-Process -Id $rawPid -ErrorAction SilentlyContinue
  if ($null -eq $proc) {
    Remove-Item $PidFile -ErrorAction SilentlyContinue
    return $null
  }

  return [int]$rawPid
}

function Stop-PidIfRunning {
  param([Parameter(Mandatory = $true)][string]$PidFile)

  $runningPid = Read-PidIfRunning -PidFile $PidFile
  if (-not $runningPid) {
    return $false
  }

  try {
    Stop-Process -Id $runningPid -Force -ErrorAction Stop
  } catch {
    Write-Host "[WARN] Unable to stop PID ${runningPid}: $($_.Exception.Message)"
  }

  Remove-Item $PidFile -ErrorAction SilentlyContinue
  return $true
}

Write-Host "NeighbourLink one-command startup"

$projectRoot = Resolve-Path $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$runDir = Join-Path $projectRoot ".run"
$logDir = Join-Path $runDir "logs"
$backendHealthUrl = "http://127.0.0.1:8080/api/health"
$frontendHealthUrl = "http://127.0.0.1:5173"

if (-not (Test-Path $backendDir)) {
  throw "Backend directory not found: $backendDir"
}

if (-not (Test-Path $frontendDir)) {
  throw "Frontend directory not found: $frontendDir"
}

Assert-Command -Name "java" -InstallHint "Please install Java 17 and ensure java is on PATH."
Assert-Command -Name "mvn" -InstallHint "Please install Maven and ensure mvn is on PATH."
Assert-Command -Name "npm" -InstallHint "Please install Node.js (with npm) and ensure npm is on PATH."
Assert-Command -Name "node" -InstallHint "Please install Node.js and ensure node is on PATH."

New-Item -ItemType Directory -Path $runDir -Force | Out-Null
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$backendPidFile = Join-Path $runDir "backend.pid"
$frontendPidFile = Join-Path $runDir "frontend.pid"
$backendLog = Join-Path $logDir "backend.log"
$backendErr = Join-Path $logDir "backend.err.log"
$frontendLog = Join-Path $logDir "frontend.log"
$frontendErr = Join-Path $logDir "frontend.err.log"

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
  Write-Host "Installing frontend dependencies (first run)..."
  Push-Location $frontendDir
  try {
    npm install
  } finally {
    Pop-Location
  }
}

if (Test-HttpReady -Url $backendHealthUrl) {
  Write-Host "[SKIP] Backend already running on http://localhost:8080"
} else {
  $existingBackendPid = Read-PidIfRunning -PidFile $backendPidFile
  if ($existingBackendPid) {
    Write-Host "[RESTART] Backend PID $existingBackendPid is running but not ready. Restarting..."
    Stop-PidIfRunning -PidFile $backendPidFile | Out-Null
  }

  Write-Host "Packaging backend jar..."
  Push-Location $backendDir
  try {
    mvn -DskipTests package | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Backend packaging failed. See console output for Maven errors."
    }
  } finally {
    Pop-Location
  }

  $backendJar = Get-ChildItem -Path (Join-Path $backendDir "target") -Filter "*.jar" |
    Where-Object { $_.Name -notlike "*.original" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $backendJar) {
    throw "Backend jar not found after packaging. Expected under backend/target."
  }

  Write-Host "Starting backend from jar..."
  $backendJarRelativePath = Join-Path "target" $backendJar.Name
  $backendProc = Start-Process -FilePath "java" `
    -ArgumentList @("-jar", $backendJarRelativePath) `
    -WorkingDirectory $backendDir `
    -PassThru `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError $backendErr
  Set-Content -Path $backendPidFile -Value $backendProc.Id
  Write-Host "[STARTED] Backend PID: $($backendProc.Id)"
}

if (Test-HttpReady -Url $frontendHealthUrl) {
  Write-Host "[SKIP] Frontend already running on http://localhost:5173"
} else {
  $existingFrontendPid = Read-PidIfRunning -PidFile $frontendPidFile
  if ($existingFrontendPid) {
    Write-Host "[RESTART] Frontend PID $existingFrontendPid is running but not ready. Restarting..."
    Stop-PidIfRunning -PidFile $frontendPidFile | Out-Null
  }

  Write-Host "Starting frontend..."
  $frontendProc = Start-Process -FilePath "node" `
    -ArgumentList @(".\node_modules\vite\bin\vite.js", "--host", "0.0.0.0", "--port", "5173", "--strictPort") `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -RedirectStandardOutput $frontendLog `
    -RedirectStandardError $frontendErr
  Set-Content -Path $frontendPidFile -Value $frontendProc.Id
  Write-Host "[STARTED] Frontend PID: $($frontendProc.Id)"
}

Wait-ForHttpReady -Name "Backend" -Url $backendHealthUrl -TimeoutSeconds 90
Wait-ForHttpReady -Name "Frontend" -Url $frontendHealthUrl -TimeoutSeconds 90

Write-Host ""
Write-Host "All services are ready."
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend : http://localhost:8080"
Write-Host "Logs    : $logDir"
