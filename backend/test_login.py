import requests

# URL do seu backend local
url = "http://127.0.0.1:8000/auth/login"

# Dados do usuário que existe no seu Supabase
payload = {
    "email": "maria@email.com",
    "password": "senha123"
}

response = requests.post(url, json=payload)

if response.status_code == 200:
    print("Login bem-sucedido!")
    print("Token JWT:", response.json()["access_token"])
else:
    print("Erro no login:", response.status_code)
    print(response.json())
