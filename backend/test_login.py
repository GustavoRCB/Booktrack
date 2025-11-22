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

# test_login.py (Adição para testar a rota protegida)

# ... CÓDIGO DE LOGIN ANTERIOR ...

response = requests.post(url, json=payload)

if response.status_code == 200:
    print("Login bem-sucedido!")
    token = response.json()["access_token"]
    print("Token JWT:", token)

    # ----------------------------------------
    # PASSO NOVO: TESTAR UMA ROTA PROTEGIDA
    # ----------------------------------------
    protected_url = "http://127.0.0.1:8000/user/books/"
    
    # 1. Montar o cabeçalho de autorização
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # 2. Fazer a requisição GET à rota protegida
    protected_response = requests.get(protected_url, headers=headers)

    # 3. Verificar o resultado
    if protected_response.status_code == 200:
        print("\n✅ Teste de Rota Protegida BEM-SUCEDIDO!")
        print("Livros do Usuário:", protected_response.json())
    else:
        print("\n❌ Teste de Rota Protegida FALHOU:")
        print("Status Code:", protected_response.status_code)
        print("Detalhe do Erro:", protected_response.json())

else:
    print("Erro no login:", response.status_code)
    print(response.json())