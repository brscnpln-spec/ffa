import pandas as pd

# CSV'yi oku
df = pd.read_csv('attached_assets/mt_price_import_ready.csv')
df = df.fillna('')

# Kolon isimlerini eşle
# departure_city -> origin
# arrival_city -> destination  
# company_name -> partner

batch_size = 10
sql_batches = []

for i in range(0, len(df), batch_size):
    batch = df.iloc[i:i+batch_size]
    
    sql_values = []
    for idx, row in batch.iterrows():
        origin = str(row['departure_city']).replace("'", "''")
        destination = str(row['arrival_city']).replace("'", "''")
        partner = str(row['company_name']).replace("'", "''")
        transport = str(row['transport_type']).replace("'", "''")
        vehicle = str(row['vehicle_type']).replace("'", "''")
        price = float(row['price'])
        notes = str(row['notes']).replace("'", "''") if row['notes'] else ''
        
        # dimensions -> length x width x height formatında birleştir
        dimensions = ''
        if row.get('length') or row.get('width') or row.get('height'):
            dimensions = f"{row.get('length', '')} x {row.get('width', '')} x {row.get('height', '')}".strip()
        
        value = f"('{origin}', '{destination}', '{partner}', '{transport}', '{vehicle}', {price}, NULL, NULL, NULL, '{dimensions}', NULL, '{notes}')"
        sql_values.append(value)
    
    values_str = ',\n'.join(sql_values)
    sql = f"INSERT INTO prices (origin, destination, partner, transport_type, vehicle_type, price, weight, cbm, ldm, dimensions, valid_until, notes) VALUES {values_str};"
    sql_batches.append(sql)

# SQL dosyalarına kaydet
for i, sql in enumerate(sql_batches):
    with open(f'/tmp/correct_batch_{i}.sql', 'w') as f:
        f.write(sql)

print(f"✅ {len(sql_batches)} batch SQL hazırlandı!")
print(f"✅ Toplam {len(df)} kayıt")
print(f"\n📋 İlk batch örneği:")
print(sql_batches[0][:500] + "...")

