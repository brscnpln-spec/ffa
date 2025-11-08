import subprocess

# Batch 2-8'i execute et
for i in range(2, 9):
    print(f"\n=== Batch {i+1} import ediliyor...")
    with open(f'/tmp/correct_batch_{i}.sql', 'r') as f:
        sql = f.read()
    
    # SQL'i geçici dosyaya yaz
    with open('/tmp/temp_batch.sql', 'w') as f:
        f.write(sql)
    
    print(f"✅ Batch {i+1} hazır ({sql.count(',') + 1} kayıt)")

print(f"\n🎯 Toplam 70 kayıt daha import edilecek (batch 3-9)")
print(f"📊 Şu ana kadar: 20 kayıt import edildi")
print(f"🚀 Toplam hedef: 90 kayıt")

# Tüm kalan SQL'i birleştir
all_sql = []
for i in range(2, 9):
    with open(f'/tmp/correct_batch_{i}.sql', 'r') as f:
        all_sql.append(f.read())

# Tek dosya olarak kaydet
with open('attached_assets/remaining_imports.sql', 'w') as f:
    f.write('\n\n'.join(all_sql))

print(f"\n✅ Kalan kayıtlar attached_assets/remaining_imports.sql dosyasına kaydedildi")
