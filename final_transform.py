import pandas as pd
from datetime import datetime
import re

# Excel'i oku
df = pd.read_excel('attached_assets/MT Price_1762626545082.xlsx')

price_records = []
current_loading_address = "DE95 Tirschenreuth"

# ======== TABLO 1: Flatbed & Lowbed (Satır 2-29) ========
for idx in range(2, 30):
    if idx >= len(df):
        break
    
    row = df.iloc[idx]
    
    # Loading address güncelle
    if pd.notna(row['Partner']) and str(row['Partner']).strip() and str(row['Partner']) != 'nan':
        current_loading_address = str(row['Partner']).strip()
    
    delivery_country = str(row['Unnamed: 1']).strip() if pd.notna(row['Unnamed: 1']) else ''
    delivery_city = str(row['Unnamed: 2']).strip() if pd.notna(row['Unnamed: 2']) else ''
    distance = str(row['Unnamed: 3']).strip() if pd.notna(row['Unnamed: 3']) else ''
    
    if not delivery_city or delivery_city == 'nan':
        continue
    
    # Partner fiyatları
    partners_data = [
        ('DFDS', 'Flatbed', row.get('DFDS')),
        ('Muje', 'Lowbed & Flatbed', row.get('Muje')),
        ('SM', 'Flatbed', row.get('SM')),
        ('SM', 'Lowbed', row.get('Unnamed: 9')),
        ('FAB', 'Flatbed', row.get('FAB')),
        ('FAB', 'Lowbed', row.get('Unnamed: 11')),
    ]
    
    for company, vehicle_type, price in partners_data:
        if pd.notna(price) and price != '' and str(price) != 'nan':
            try:
                price_float = float(price)
                price_records.append({
                    'departure_city': current_loading_address,
                    'arrival_city': f"{delivery_city}, {delivery_country}",
                    'transport_type': 'Karayolu',
                    'vehicle_type': vehicle_type,
                    'company_name': company,
                    'price': price_float,
                    'weight': '',
                    'created_at': datetime.now().strftime('%Y-%m-%d'),
                    'valid_until': '',
                    'cbm': '',
                    'ldm': '',
                    'length': '',
                    'height': '',
                    'width': '',
                    'notes': f"Mesafe: {distance} km" if distance else ''
                })
            except:
                pass

# ======== TABLO 2: Tautliner (Satır 32-38) ========
for idx in range(31, 39):
    if idx >= len(df):
        break
    
    row = df.iloc[idx]
    
    loading = str(row['Partner']).strip() if pd.notna(row['Partner']) else ''
    if loading and loading != 'nan':
        current_loading_address = loading
    
    delivery_country = str(row['Unnamed: 1']).strip() if pd.notna(row['Unnamed: 1']) else ''
    delivery_city = str(row['Unnamed: 2']).strip() if pd.notna(row['Unnamed: 2']) else ''
    distance = str(row['Unnamed: 3']).strip() if pd.notna(row['Unnamed: 3']) else ''
    
    if not delivery_city or delivery_city == 'nan':
        continue
    
    # Tautliner boyutları
    tautliner_data = [
        ('4 LDM', row.get('Unnamed: 4')),
        ('8 LDM', row.get('Unnamed: 5')),
        ('FTL', row.get('DFDS')),  # FTL kolonu DFDS kolonunda
    ]
    
    for ldm_size, price in tautliner_data:
        if pd.notna(price) and price != '' and str(price) != 'nan':
            try:
                price_float = float(price)
                notes = f"Mesafe: {distance} km" if distance else ''
                # Özel notlar varsa ekle
                if pd.notna(row.get('Muje')) and str(row.get('Muje')) != 'nan':
                    notes += f" - {row.get('Muje')}"
                
                price_records.append({
                    'departure_city': current_loading_address,
                    'arrival_city': f"{delivery_city}, {delivery_country}",
                    'transport_type': 'Karayolu',
                    'vehicle_type': f'Tautliner {ldm_size}',
                    'company_name': 'MT (Partner)',
                    'price': price_float,
                    'weight': '',
                    'created_at': datetime.now().strftime('%Y-%m-%d'),
                    'valid_until': '',
                    'cbm': '',
                    'ldm': ldm_size.replace(' LDM', '') if 'LDM' in ldm_size else '',
                    'length': '',
                    'height': '',
                    'width': '',
                    'notes': notes
                })
            except:
                pass

# CSV'ye kaydet
result_df = pd.DataFrame(price_records)
output_file = 'attached_assets/mt_price_final.csv'
result_df.to_csv(output_file, index=False, encoding='utf-8')

print(f"✅ Toplam {len(price_records)} fiyat kaydı oluşturuldu!")
print(f"✅ Dosya: {output_file}")
print(f"\n📊 Partner Dağılımı:")
print(result_df['company_name'].value_counts())
print(f"\n📊 Araç Tipi Dağılımı:")
print(result_df['vehicle_type'].value_counts())
print(f"\n📋 İlk 10 kayıt:")
print(result_df.head(10).to_string())
