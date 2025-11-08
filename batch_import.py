import pandas as pd
import json
import subprocess

# CSV'yi oku
df = pd.read_csv('attached_assets/mt_price_import_ready.csv')
df = df.fillna('')

# Her batch 10 kayıt
batch_size = 10
total_inserted = 0

for i in range(0, len(df), batch_size):
    batch = df.iloc[i:i+batch_size]
    
    sql_values = []
    for idx, row in batch.iterrows():
        departure = str(row['departure_city']).replace("'", "''")
        arrival = str(row['arrival_city']).replace("'", "''")
        transport = str(row['transport_type']).replace("'", "''")
        vehicle = str(row['vehicle_type']).replace("'", "''")
        company = str(row['company_name']).replace("'", "''")
        price = float(row['price'])
        notes = str(row['notes']).replace("'", "''") if row['notes'] else ''
        
        value = f"('{departure}', '{arrival}', '{transport}', '{vehicle}', '{company}', {price}, NULL, CURRENT_DATE, NULL, NULL, NULL, NULL, NULL, NULL, '{notes}')"
        sql_values.append(value)
    
    # Batch INSERT
    values_str = ',\n'.join(sql_values)
    sql = f"INSERT INTO prices (departure_city, arrival_city, transport_type, vehicle_type, company_name, price, weight, created_at, valid_until, cbm, ldm, length, height, width, notes) VALUES {values_str};"
    
    # SQL dosyasına kaydet
    batch_file = f'/tmp/batch_{i}.sql'
    with open(batch_file, 'w') as f:
        f.write(sql)
    
    total_inserted += len(batch)
    print(f"✅ Batch {i//batch_size + 1}: {len(batch)} kayıt hazır")

print(f"\n🎉 Toplam {total_inserted} kayıt hazırlandı!")
print(f"\n📝 SQL dosyaları /tmp/batch_*.sql olarak kaydedildi")
print(f"\n🚀 Manuel import için SQL komutları:")

# Tek bir büyük SQL dosyası oluştur
with open('attached_assets/full_import.sql', 'w') as outfile:
    for i in range(0, len(df), batch_size):
        batch_file = f'/tmp/batch_{i}.sql'
        with open(batch_file, 'r') as infile:
            outfile.write(infile.read())
            outfile.write('\n\n')

print("✅ Tüm SQL komutları attached_assets/full_import.sql dosyasına birleştirildi")
