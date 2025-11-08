import pandas as pd
from datetime import datetime

# Excel'i oku
df = pd.read_excel('attached_assets/MT Price_1762626545082.xlsx')

# Boş listeye dönüştürülecek veriler
price_records = []

# İlk satır başlıkları içeriyor, atla
data_rows = df.iloc[1:].reset_index(drop=True)

# Partner kolonları (DFDS, Muje, SM, FAB vb.)
partner_columns = {
    'DFDS': 'Flatbed',
    'Muje': 'Lowbed & Flatbed',
    'SM': 'Flatbed',
    'FAB': 'Flatbed'
}

# Her satırı işle
for idx, row in data_rows.iterrows():
    departure = str(row['Partner']).strip() if pd.notna(row['Partner']) else ''
    delivery_country = str(row['Unnamed: 1']).strip() if pd.notna(row['Unnamed: 1']) else ''
    delivery_city = str(row['Unnamed: 2']).strip() if pd.notna(row['Unnamed: 2']) else ''
    
    # Boş satırları atla
    if not departure or departure == 'nan':
        continue
    
    # Her partner için kayıt oluştur
    for partner, vehicle_type in partner_columns.items():
        if partner in df.columns and pd.notna(row[partner]):
            price = row[partner]
            if pd.notna(price) and price != '' and str(price) != 'nan':
                try:
                    price_float = float(price)
                    price_records.append({
                        'departure_city': departure,
                        'arrival_city': f"{delivery_city}, {delivery_country}",
                        'transport_type': 'Karayolu',  # Varsayılan
                        'vehicle_type': vehicle_type,
                        'company_name': partner,
                        'price': price_float,
                        'weight': '',
                        'created_at': datetime.now().strftime('%Y-%m-%d'),
                        'valid_until': '',
                        'cbm': '',
                        'ldm': '',
                        'length': '',
                        'height': '',
                        'width': '',
                        'notes': f"Distance: {row['Unnamed: 3']} km" if pd.notna(row['Unnamed: 3']) else ''
                    })
                except:
                    pass

# DataFrame oluştur ve CSV'ye kaydet
result_df = pd.DataFrame(price_records)
output_file = 'attached_assets/mt_price_import_formatted.csv'
result_df.to_csv(output_file, index=False, encoding='utf-8')

print(f"✅ Toplam {len(price_records)} fiyat kaydı oluşturuldu!")
print(f"✅ Dosya kaydedildi: {output_file}")
print(f"\n📋 İlk 5 kayıt:")
print(result_df.head().to_string())
