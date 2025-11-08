import pandas as pd
import os
import json

# CSV'yi oku
df = pd.read_csv('attached_assets/mt_price_import_ready.csv')

# NaN değerlerini NULL/boş string yap
df = df.fillna('')

# SQL INSERT komutları oluştur
sql_statements = []

for idx, row in df.iterrows():
    # Değerleri hazırla
    departure_city = str(row['departure_city']).replace("'", "''")
    arrival_city = str(row['arrival_city']).replace("'", "''")
    transport_type = str(row['transport_type']).replace("'", "''")
    vehicle_type = str(row['vehicle_type']).replace("'", "''")
    company_name = str(row['company_name']).replace("'", "''")
    price = float(row['price']) if row['price'] else 'NULL'
    weight = f"'{row['weight']}'" if row['weight'] else 'NULL'
    created_at = f"'{row['created_at']}'" if row['created_at'] else 'CURRENT_DATE'
    valid_until = f"'{row['valid_until']}'" if row['valid_until'] else 'NULL'
    cbm = f"'{row['cbm']}'" if row['cbm'] else 'NULL'
    ldm = f"'{row['ldm']}'" if row['ldm'] else 'NULL'
    length = f"'{row['length']}'" if row['length'] else 'NULL'
    height = f"'{row['height']}'" if row['height'] else 'NULL'
    width = f"'{row['width']}'" if row['width'] else 'NULL'
    notes = str(row['notes']).replace("'", "''") if row['notes'] else ''
    
    sql = f"""INSERT INTO prices (departure_city, arrival_city, transport_type, vehicle_type, company_name, price, weight, created_at, valid_until, cbm, ldm, length, height, width, notes)
VALUES ('{departure_city}', '{arrival_city}', '{transport_type}', '{vehicle_type}', '{company_name}', {price}, {weight}, {created_at}, {valid_until}, {cbm}, {ldm}, {length}, {height}, {width}, '{notes}');"""
    
    sql_statements.append(sql)

# SQL dosyasına kaydet
output_file = 'attached_assets/import_prices.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("-- MT Price Import (90 kayıt)\n")
    f.write("-- Lowbed & Flatbed kayıtları ayrıştırılmış\n\n")
    f.write('\n'.join(sql_statements))

print(f"✅ {len(sql_statements)} SQL INSERT komutu oluşturuldu!")
print(f"✅ Dosya: {output_file}")
print(f"\n🚀 Şimdi Supabase'e import ediliyor...")

