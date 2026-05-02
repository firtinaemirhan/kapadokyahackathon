#!/bin/bash

# ============================================
# Kapadokya Hackathon 2026 — Auto Commit Script
# Big3 Takımı | Saatlik otomatik commit
# ============================================
# Kullanım:
#   chmod +x auto_commit.sh
#   ./auto_commit.sh
#
# Durdurmak için: Ctrl+C
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTERVAL="${INTERVAL:-3600}"  # 1 saat (saniye)
RUN_ONCE="${RUN_ONCE:-0}"
COMMIT_COUNT=0

echo "╔══════════════════════════════════════════╗"
echo "║   Big3 Auto-Commit — Hackathon 2026      ║"
echo "║   Her 60 dakikada bir commit atılır       ║"
echo "║   Durdurmak için: Ctrl+C                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""

cd "$SCRIPT_DIR" || exit 1

# Git repo kontrolü. Parent klasörde yanlışlıkla repo varsa onu kullanma.
PARENT_ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
if [ ! -e "$SCRIPT_DIR/.git" ]; then
  DETECTED_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
  if [ "$DETECTED_ROOT" != "$SCRIPT_DIR" ]; then
    echo "ℹ️  Proje klasöründe ayrı git repo yok; burada yeni repo başlatılıyor."
    git init -b main >/dev/null 2>&1 || git init >/dev/null
    if [ -n "$PARENT_ORIGIN" ] && ! git remote get-url origin &>/dev/null; then
      git remote add origin "$PARENT_ORIGIN"
      echo "  🔗 Origin aktarıldı: $PARENT_ORIGIN"
    fi
  fi
fi

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo "❌ HATA: Bu klasör bir git reposu değil!"
  echo "   Önce 'git init' veya 'git clone' yapın."
  exit 1
fi

if [ -z "$(git config user.name || true)" ]; then
  git config user.name "${GIT_AUTHOR_NAME:-Big3 Auto Commit}"
fi

if [ -z "$(git config user.email || true)" ]; then
  git config user.email "${GIT_AUTHOR_EMAIL:-big3-auto-commit@example.local}"
fi

# İlk durumu göster
echo "📁 Repo: $(git rev-parse --show-toplevel)"
echo "🌿 Branch: $(git branch --show-current)"
echo "⏰ Başlangıç: $(date '+%H:%M:%S')"
echo ""

commit_now() {
  COMMIT_COUNT=$((COMMIT_COUNT + 1))
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  SHORT_TIME=$(date '+%H:%M')

  # Değişiklik var mı kontrol et
  git add -A

  COMMIT_BODY="The competition requires regular progress commits, so this checkpoint records the current repository state at ${TIMESTAMP}."
  COMMIT_TRAILERS=$'Constraint: Hourly commits are required for Kapadokya Hackathon participation\nConfidence: high\nScope-risk: narrow\nTested: auto_commit.sh executed\nNot-tested: Remote push can still fail when authentication or network is unavailable'

  if git diff --cached --quiet; then
    # Değişiklik yoksa boş commit at
    git commit --allow-empty \
      -m "Record hourly hackathon checkpoint ${SHORT_TIME} [${COMMIT_COUNT}]" \
      -m "$COMMIT_BODY" \
      -m "$COMMIT_TRAILERS"
    echo "  ⚪ Boş commit atıldı (değişiklik yoktu)"
  else
    # Değişiklik varsa normal commit
    CHANGED_FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')
    git commit \
      -m "Record hourly hackathon checkpoint ${SHORT_TIME} [${COMMIT_COUNT}]" \
      -m "$COMMIT_BODY Changed files: ${CHANGED_FILES}." \
      -m "$COMMIT_TRAILERS"
    echo "  🟢 ${CHANGED_FILES} dosya commit edildi"
  fi

  # Push dene
  if git remote get-url origin &>/dev/null; then
    if git push 2>/dev/null; then
      echo "  ☁️  GitHub'a push edildi"
    else
      echo "  ⚠️  Push başarısız — commit local'de mevcut"
    fi
  else
    echo "  📌 Remote yok — commit local'de mevcut"
  fi

  echo ""
}

# Geri sayım göstergesi
countdown() {
  local secs=$INTERVAL
  while [ $secs -gt 0 ]; do
    local mins=$((secs / 60))
    local remaining=$((secs % 60))
    printf "\r  ⏳ Sonraki commit: %02d:%02d  " $mins $remaining
    sleep 1
    secs=$((secs - 1))
  done
  printf "\r                                    \r"
}

# İlk commit hemen
echo "🚀 İlk commit atılıyor..."
commit_now

# Döngü
while true; do
  if [ "$RUN_ONCE" = "1" ]; then
    echo "✅ RUN_ONCE=1; ilk commit sonrası çıkılıyor."
    exit 0
  fi

  NEXT_EPOCH=$(($(date +%s) + INTERVAL))
  NEXT_TIME=$(date -r "$NEXT_EPOCH" '+%H:%M' 2>/dev/null || date -d "@$NEXT_EPOCH" '+%H:%M')
  echo "🕐 Sıradaki commit: $NEXT_TIME"
  countdown
  echo "📝 Commit #$((COMMIT_COUNT + 1)) atılıyor..."
  commit_now
done
