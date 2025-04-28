#!/bin/bash
echo "🔍 Validating Prisma Schemas for All Services"

for svc in auth general-ledger reporting api-gateway; do
  echo "➡️ Checking service: $svc"
  cd services/$svc || continue

  if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Found schema.prisma"
    npx prisma validate
    npx prisma generate
    npx prisma migrate dev --create-only --name preview_${svc}
  else
    echo "⚠️ No schema.prisma in $svc"
  fi

  cd - > /dev/null
done
