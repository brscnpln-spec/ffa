import pandas as pd
import sys

try:
    # Excel dosyasını oku
    df = pd.read_excel('attached_assets/MT Price_1762626545082.xlsx')
    
    # İlk birkaç satırı göster
    print("=== Excel Dosyası İçeriği ===")
    print(f"Toplam satır sayısı: {len(df)}")
    print(f"\nKolonlar: {list(df.columns)}")
    print(f"\nİlk 5 satır:")
    print(df.head().to_string())
    
    # CSV'ye çevir
    output_file = 'attached_assets/mt_price_import.csv'
    df.to_csv(output_file, index=False, encoding='utf-8')
    print(f"\n✅ CSV dosyası oluşturuldu: {output_file}")
    
except Exception as e:
    print(f"❌ Hata: {e}")
    sys.exit(1)
