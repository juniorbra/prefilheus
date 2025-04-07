@echo off
echo Atualizando repositório Git e imagem Docker...

REM Adicionar todas as alterações ao Git
git add .

REM Solicitar mensagem de commit
set /p commit_msg="Mensagem de commit: "
git commit -m "%commit_msg%"

REM Enviar alterações para o GitHub
git push

REM Construir a nova imagem Docker
docker build -t ghcr.io/juniorbra/prefilheus:latest .

REM Enviar a imagem para o GitHub Container Registry
docker push ghcr.io/juniorbra/prefilheus:latest

echo.
echo Processo concluído! A imagem ghcr.io/juniorbra/prefilheus:latest foi atualizada.
echo Nova hash SHA256:
docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/juniorbra/prefilheus:latest
