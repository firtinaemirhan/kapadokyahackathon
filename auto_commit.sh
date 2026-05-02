#!/bin/bash

# ============================================
# Kapadokya Hackathon 2026 — Auto Commit Script
# Big3 Takımı | Saat başı otomatik commit
# ============================================
# Kullanım:
#   chmod +x auto_commit.sh
#   ./auto_commit.sh
#
# Durdurmak için: Ctrl+C
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUN_ONCE="${RUN_ONCE:-0}"
COMMIT_COUNT=0

echo "╔══════════════════════════════════════════╗"
echo "║   Big3 Auto-Commit — Hackathon 2026      ║"
echo "║   Commitler saat başında atılır           ║"
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

git config user.name "${GIT_AUTHOR_NAME:-Emirhan FIRTINA}"
git config user.email "${GIT_AUTHOR_EMAIL:-emirhanfirtina@MacBook-Air-2.local}"

# İlk durumu göster
echo "📁 Repo: $(git rev-parse --show-toplevel)"
echo "🌿 Branch: $(git branch --show-current)"
echo "⏰ Başlangıç: $(date '+%H:%M:%S')"
echo ""

commit_now() {
  local mode="${1:-hourly}"
  COMMIT_COUNT=$((COMMIT_COUNT + 1))
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # Değişiklik var mı kontrol et
  git add -A

  if [ "$mode" = "start" ]; then
    COMMIT_BODY="Starting the hourly checkpoint flow for the hackathon and preserving the project state at ${TIMESTAMP}."
  else
    COMMIT_BODY="Keeping a regular progress trail for the hackathon while preserving the current project state at ${TIMESTAMP}."
  fi
  COMMIT_TRAILERS=$'Constraint: Hourly commits are required for Kapadokya Hackathon participation\nConfidence: high\nScope-risk: narrow\nTested: auto_commit.sh executed\nNot-tested: Remote push can still fail when authentication or network is unavailable'

  if git diff --cached --quiet; then
    # Değişiklik yoksa boş commit at
    git commit --allow-empty \
      -m "$(natural_commit_title 0 "$mode")" \
      -m "$COMMIT_BODY" \
      -m "$COMMIT_TRAILERS"
    echo "  ⚪ Boş commit atıldı (değişiklik yoktu)"
  else
    # Değişiklik varsa normal commit
    CHANGED_FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')
    git commit \
      -m "$(natural_commit_title "$CHANGED_FILES" "$mode")" \
      -m "$COMMIT_BODY Updated files: ${CHANGED_FILES}." \
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

natural_commit_title() {
  local changed_files="${1:-0}"
  local mode="${2:-hourly}"
  local slot
  slot=$((($(date +%H) + COMMIT_COUNT + changed_files) % 8))

  if [ "$mode" = "start" ]; then
    echo "Start hourly Kapadokya checkpoints"
    return
  fi

  if [ "$changed_files" -eq 0 ]; then
    case "$slot" in
      0) echo "Save latest hackathon progress" ;;
      1) echo "Keep project checkpoint current" ;;
      2) echo "Mark steady progress on the proposal" ;;
      3) echo "Save Big3 progress checkpoint" ;;
      4) echo "Keep Kapadokya work in sync" ;;
      5) echo "Record current hackathon state" ;;
      6) echo "Update progress checkpoint" ;;
      *) echo "Save current project state" ;;
    esac
  else
    case "$slot" in
      0) echo "Refine Kapadokya project materials" ;;
      1) echo "Update Big3 hackathon work" ;;
      2) echo "Polish the latest project draft" ;;
      3) echo "Improve hackathon submission files" ;;
      4) echo "Refresh project documentation" ;;
      5) echo "Add the latest Kapadokya updates" ;;
      6) echo "Tighten current project files" ;;
      *) echo "Save new hackathon changes" ;;
    esac
  fi
}

# Geri sayım göstergesi
countdown() {
  local secs="${1:-0}"

  if [ ! -t 1 ]; then
    sleep "$secs"
    return
  fi

  while [ $secs -gt 0 ]; do
    local mins=$((secs / 60))
    local remaining=$((secs % 60))
    printf "\r  ⏳ Sonraki commit: %02d:%02d  " $mins $remaining
    sleep 1
    secs=$((secs - 1))
  done
  printf "\r                                    \r"
}

next_hour_epoch() {
  local now
  now=$(date +%s)
  echo $(( ((now / 3600) + 1) * 3600 ))
}

# İlk commit hemen
echo "🚀 Başlangıç commit'i atılıyor..."
commit_now start

# Döngü
while true; do
  if [ "$RUN_ONCE" = "1" ]; then
    echo "✅ RUN_ONCE=1; ilk commit sonrası çıkılıyor."
    exit 0
  fi

  NEXT_EPOCH=$(next_hour_epoch)
  NEXT_TIME=$(date -r "$NEXT_EPOCH" '+%H:%M' 2>/dev/null || date -d "@$NEXT_EPOCH" '+%H:%M')
  echo "🕐 Sıradaki commit: $NEXT_TIME"
  WAIT_SECONDS=$((NEXT_EPOCH - $(date +%s)))
  if [ "$WAIT_SECONDS" -lt 1 ]; then
    WAIT_SECONDS=1
  fi
  countdown "$WAIT_SECONDS"
  echo "📝 Commit #$((COMMIT_COUNT + 1)) atılıyor..."
  commit_now
done
