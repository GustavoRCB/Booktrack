import os

project_root = r"C:\Users\Dyon\Desktop\backlivros"
output_file = os.path.join(project_root, "codigo_completo_atualizado.txt")

EXTENSOES = [".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css"]

with open(output_file, "w", encoding="utf-8") as outfile:
    for root, dirs, files in os.walk(project_root):
        if "venv" in root or "node_modules" in root:
            continue
        
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSOES):
                file_path = os.path.join(root, file)

                outfile.write("\n\n" + "="*80 + "\n")
                outfile.write(f"# ARQUIVO: {file_path}\n")
                outfile.write("="*80 + "\n\n")

                try:
                    with open(file_path, "r", encoding="utf-8") as infile:
                        outfile.write(infile.read())
                except:
                    outfile.write("Erro lendo este arquivo.\n")
