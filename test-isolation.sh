#!/bin/sh
# ══════════════════════════════════════════════════════════════
#  test-isolation.sh — Démonstration isolation réseau
#  Usage : chmod +x test-isolation.sh && ./test-isolation.sh
# ══════════════════════════════════════════════════════════════

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo ""
echo "════════════════════════════════════════════════"
echo "  🔍 TEST D'ISOLATION RÉSEAU — API 2 (Messagerie)"
echo "════════════════════════════════════════════════"
echo ""

# Test 1 : API 2 répond bien
echo "${YELLOW}[Test 1]${NC} API 2 /health (doit RÉUSSIR)"
curl -sf http://localhost:8000/health | grep -q "ok" \
  && echo "${GREEN}  ✅ PASS — API 2 répond${NC}" \
  || echo "${RED}  ❌ FAIL — API 2 ne répond pas${NC}"

echo ""

# Test 2 : API 2 ne peut PAS atteindre db1
echo "${YELLOW}[Test 2]${NC} API 2 → db1:27017 (doit ÉCHOUER — isolation)"
docker compose exec api2 \
  sh -c 'nc -zw2 db1 27017 2>/dev/null && echo REACHABLE || echo UNREACHABLE' \
  | grep -q 'UNREACHABLE' \
  && echo "${GREEN}  ✅ PASS — API 2 ne peut PAS atteindre db1 (isolation OK)${NC}" \
  || echo "${RED}  ❌ FAIL — API 2 peut atteindre db1 (isolation BRISÉE !)${NC}"

echo ""

# Test 3 : API 1 ne peut PAS atteindre db2
echo "${YELLOW}[Test 3]${NC} API 1 → db2:27017 (doit ÉCHOUER — isolation croisée)"
docker compose exec api1 \
  sh -c 'nc -zw2 db2 27017 2>/dev/null && echo REACHABLE || echo UNREACHABLE' \
  | grep -q 'UNREACHABLE' \
  && echo "${GREEN}  ✅ PASS — API 1 ne peut PAS atteindre db2 (isolation OK)${NC}" \
  || echo "${RED}  ❌ FAIL — API 1 peut atteindre db2 (isolation BRISÉE !)${NC}"

echo ""

# Test 4 : db1 et db2 ne se voient pas
echo "${YELLOW}[Test 4]${NC} db1 → db2 (doit ÉCHOUER)"
docker compose exec db1 \
  sh -c 'nc -zw2 db2 27017 2>/dev/null && echo REACHABLE || echo UNREACHABLE' \
  | grep -q 'UNREACHABLE' \
  && echo "${GREEN}  ✅ PASS — db1 et db2 sont isolées${NC}" \
  || echo "${RED}  ❌ FAIL — db1 peut joindre db2 (isolation BRISÉE !)${NC}"

echo ""

# Test 5 : hôte ne peut pas joindre db2 directement
echo "${YELLOW}[Test 5]${NC} Hôte → db2:27017 (doit ÉCHOUER)"
nc -zw2 localhost 27017 2>/dev/null \
  && echo "${RED}  ❌ FAIL — db2 est exposée sur l'hôte${NC}" \
  || echo "${GREEN}  ✅ PASS — db2 non accessible depuis l'hôte${NC}"

echo ""
echo "════════════════════════════════════════════════"
echo "  Tous les ✅ = isolation réseau correcte."
echo "════════════════════════════════════════════════"
echo ""