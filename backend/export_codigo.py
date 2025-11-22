import os

# Caminho raiz do projeto
project_path = r"C:\Users\Dyon\Desktop\backlivros\backend"
output_file = r"C:\Users\Dyon\Desktop\backlivros\codigo_atualizado.txt"

with open(output_file, "w", encoding="utf-8") as outfile:
    for root, dirs, files in os.walk(project_path):
        for file in files:
            if file.endswith(".py"):  # ou outras extensões que quiser incluir
                file_path = os.path.join(root, file)
                outfile.write(f"\n\n# --- {file_path} ---\n\n")
                with open(file_path, "r", encoding="utf-8") as infile:
                    outfile.write(infile.read())
