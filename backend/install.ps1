$ErrorActionPreference = 'Stop'
$venv = Join-Path $PSScriptRoot '.venv'
if(!(Test-Path $venv)) { python -m venv $venv }
$activate = Join-Path $venv 'Scripts/Activate.ps1'
. $activate
pip install -r (Join-Path $PSScriptRoot 'requirements.txt')
Write-Host 'Backend environment ready.'
