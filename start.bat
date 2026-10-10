@echo off
title Cérebro Virtual - Agente Multimodal
echo ========================================================
echo        CÉREBRO VIRTUAL - LABORATÓRIO COMPUTACIONAL
echo ========================================================
echo.
echo Verificando instalação do Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python não foi encontrado no PATH do Windows.
    echo Por favor, instale o Python 3.10+ e marque "Add Python to PATH".
    pause
    exit /b 1
)

echo Iniciando o Cérebro Virtual...
echo O navegador será aberto automaticamente em http://localhost:8000
python start.py
if %errorlevel% neq 0 (
    echo [AVISO] O processo foi encerrado.
    pause
)
