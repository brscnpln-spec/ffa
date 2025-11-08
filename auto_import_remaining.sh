#!/bin/bash

# Batch 2-8'i import et
for i in {2..8}; do
    echo "=== Batch $((i+1)) import ediliyor..."
    cat /tmp/correct_batch_${i}.sql
    echo ""
done
