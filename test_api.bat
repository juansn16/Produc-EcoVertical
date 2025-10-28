@echo off
echo Obteneriendo token...
for /f "tokens=*" %%a in ('curl -s -X POST "https://api-ecovertical.onrender.com/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"montoyugi@gmail.com\",\"password\":\"Ubiquiti3.\"}"') do set LOGIN_RESPONSE=%%a
echo %LOGIN_RESPONSE%
echo.
echo Probando editar comentario...
curl -s -X PUT "https://api-ecovertical.onrender.com/api/comments/1753aa92-b21c-45f2-8c13-44b5723080c5" -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN_AQUI" -d "{\"contenido\":\"TEST EDITADO\",\"tipo_comentario\":\"general\"}"
gend

