#!/usr/bin/env bash
# Hook SessionStart : charge le second cerveau de Daniel à chaque session Claude Code.
# 1. clone (ou met à jour) le dépôt Second_brain ;
# 2. rend ses skills disponibles (~/.claude/skills) ;
# 3. affiche ses consignes + la note de reprise, qui entrent dans le contexte de Claude.
# Ne bloque jamais le démarrage : toute erreur est signalée puis ignorée.
set -u
REPO="https://github.com/danielpietrzyk1911-eng/Second_brain"
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then DIR="/home/user/second_brain"; else DIR="${SECOND_BRAIN_DIR:-$HOME/second_brain}"; fi

if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull -q --ff-only origin main >/dev/null 2>&1 || echo "(second cerveau : mise à jour impossible, version locale utilisée)"
else
  if [ -e "$DIR" ] && [ -n "$(ls -A "$DIR" 2>/dev/null)" ]; then
    echo "SECOND CERVEAU : $DIR existe déjà sans être un dépôt git, il n'a pas été touché."
    exit 0
  fi
  if ! timeout 120 git clone -q "$REPO" "$DIR" >/dev/null 2>&1; then
    echo "SECOND CERVEAU INDISPONIBLE : clonage de $REPO impossible."
    echo "Prévenir Daniel en une phrase et lui proposer de cocher le dépôt Second_brain au démarrage de la session."
    exit 0
  fi
fi

# Skills du second cerveau : copiés seulement s'ils n'existent pas déjà (les skills déjà présents priment)
mkdir -p "$HOME/.claude/skills"
for s in "$DIR"/.claude/skills/*/; do
  [ -d "$s" ] || continue
  n=$(basename "$s")
  [ -e "$HOME/.claude/skills/$n" ] || cp -r "$s" "$HOME/.claude/skills/$n"
done

cat <<MSG
=== SECOND CERVEAU DE DANIEL chargé dans $DIR ===
C'est la mémoire partagée entre toutes les sessions Claude. Le suivre à CHAQUE session, même si Daniel n'en parle pas :
- Début : appliquer « À faire en début de session » de CLAUDE.md ci-dessous (fiche du projet dans 01-Projets/<projet>/).
- Pendant : écrire toute connaissance durable (préférence, décision, fait projet) dès qu'elle apparaît.
- Fin : journal + décisions + mise à jour de 00-Inbox/Reprise.md, puis
  git -C $DIR add -A && git -C $DIR commit -m "notes: <projet> — <résumé>" && git -C $DIR pull --rebase origin main && git -C $DIR push origin main
- Autres sessions en cours : list_sessions / list_events (claude-code-remote) pour voir ce qu'elles font, send_message pour leur transmettre une info. La mémoire durable reste ce dépôt.
- Skills du second cerveau : $(ls "$DIR/.claude/skills" | tr '\n' ' ')

----- CLAUDE.md -----
MSG
cat "$DIR/CLAUDE.md"
echo
echo "----- 00-Inbox/Reprise.md -----"
cat "$DIR/00-Inbox/Reprise.md"
exit 0
