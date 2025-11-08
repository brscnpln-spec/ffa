import pandas as pd
from datetime import datetime

# CSV'yi oku
df = pd.read_csv('attached_assets/mt_price_final.csv')

final_records = []

for idx, row in df.iterrows():
    if row['vehicle_type'] == 'Lowbed & Flatbed':
        # İki ayrı kayıt oluştur
        # 1. Flatbed kaydı
        flatbed_record = row.copy()
        flatbed_record['vehicle_type'] = 'Flatbed'
        final_records.append(flatbed_record)
        
        # 2. Lowbed kaydı
        lowbed_record = row.copy()
        lowbed_record['vehicle_type'] = 'Lowbed'
        final_records.append(lowbed_record)
    else:
        # Diğer kayıtları olduğu gibi ekle
        final_records.append(row)

# Yeni DataFrame oluştur
result_df = pd.DataFrame(final_records)

# CSV'ye kaydet
output_file = 'attached_assets/mt_price_import_ready.csv'
result_df.to_csv(output_file, index=False, encoding='utf-8')

print(f"✅ Toplam {len(result_df)} fiyat kaydı hazırlandı!")
print(f"✅ Dosya: {output_file}")
print(f"\n📊 Araç Tipi Dağılımı:")
print(result_df['vehicle_type'].value_counts())

# İlk 10 kaydı göster
print(f"\n📋 İlk 10 kayıt:")
print(result_df.head(10)[['departure_city', 'arrival_city', 'vehicle_type', 'company_name', 'price']].to_string())
