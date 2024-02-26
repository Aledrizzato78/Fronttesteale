import csv
import sqlite3
from datetime import datetime

# Função para converter a data de string para formato de data do SQLite
def convert_date(date_string):
    try:
        return datetime.strptime(date_string, '%d/%m/%Y').date()
    except ValueError:
        print(f"Erro: Data inválida: {date_string}")
        return None

# Conectar ao banco de dados SQLite
conn = sqlite3.connect('/home/alexandre/arms/index e app/dados.db')
cursor = conn.cursor()

# Criar tabela no banco de dados SQLite se não existir
cursor.execute('''CREATE TABLE IF NOT EXISTS dados (
                    coluna1 DATE,
                    coluna2 DATE,
                    coluna3 INTEGER,
                    coluna4 REAL
                 )''')

# Abrir o arquivo CSV e inserir os dados na tabela SQLite
with open('/home/alexandre/arms/a.csv', 'r', newline='') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')  # Usar vírgula como separador
    next(csv_reader)  # Ignorar cabeçalho se houver
    for row in csv_reader:
        # Remover valores vazios da linha
        row = [value.strip() for value in row if value.strip()]
        # Se a linha tem 4 valores, inserir na tabela
        if len(row) == 4:
            # Converter datas para formato de data do SQLite
            row[0] = convert_date(row[0])
            row[1] = convert_date(row[1])
            # Converter valores numéricos se forem válidos
            try:
                row[2] = int(row[2])
                row[3] = float(row[3].replace(',', '.'))  # Substituir vírgula por ponto nos valores reais
            except ValueError as e:
                print(f"Erro ao converter valor: {e}")
                continue
            # Inserir na tabela SQLite
            cursor.execute('''INSERT INTO dados (coluna1, coluna2, coluna3, coluna4) 
                              VALUES (?, ?, ?, ?)''', row)
        else:
            print(f"Erro: Linha com número incorreto de valores: {row}")

# Commit das alterações e fechar conexão
conn.commit()
conn.close()
