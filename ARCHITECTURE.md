# Architecture — FFBC Trip

## STACK TECHNIQUE
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- Resend (emails transactionnels)
- Stripe (paiements CB)

## FLOW UTILISATEUR
1. Site web FFBC → lien vers /recapitulatif/[tripId]
2. Page récap → sélection participants + options
3. Clic "Payer" → redirection connexion/inscription
4. Auth OTP → retour page récap
5. Choix mode paiement → CB/Virement/Chèque/ANCV
6. Pré-réservation créée → email confirmation
7. Admin valide → statut CONFIRMEE
8. Client signe contrat → obligatoire pour solder
9. Client paie solde → statut COMPLETE

## PAGES
app/
  page.tsx                    → redirect /recapitulatif
  recapitulatif/[tripId]/     → page réservation
  connexion/                  → login OTP email
  inscription/                → register
  verification/               → saisie code OTP
  paiement/                   → page paiement
  dashboard/                  → espace client
  admin/                      → back-office (à venir)

## COMPOSANTS CLÉS
navbar.tsx                    → header avec logo
trip-card.tsx                 → card voyage
participant-selection-card.tsx → sélection nb participants
participant-info-card.tsx     → infos participant
price-estimate-card.tsx       → récap prix + acompte
action-buttons.tsx            → boutons Payer/Retour
add-participant-modal.tsx     → popup ajout participant
app-frame.tsx                 → layout global

## DASHBOARD ONGLETS
participants  → liste + ajout + suppression
paiements     → résumé + historique + ajouter
options       → options disponibles + sélectionnées
contrat       → CGV + signature en ligne
documents     → upload par participant + statuts
details       → infos voyage (J-30)
contact       → email, tel, horaires

## SUPABASE
client.ts     → createBrowserClient (côté client)
server.ts     → createServerClient (côté serveur)
middleware.ts → protection routes + redirections

## SÉCURITÉ
- RLS sur toutes les tables
- Middleware Next.js protège /dashboard et /admin
- Logique métier → Edge Functions Supabase
- Paiements → validés via webhook Stripe uniquement
- ANCV → max 500€ bloqué en DB
- Contrat → obligatoire avant solde

## EMAILS (Resend)
Edge Functions déclenchées par :
- Cron J+8 → email admin (acompte non validé ?)
- Cron J+9 → email client (dernière chance)
- Cron J+10 → expiration auto + email client
- Cron J-40 → rappel solde client
- Trigger upload doc → email admin
- Trigger paiement → email admin
- Trigger contrat signé → email admin

## STORAGE BUCKETS
trip_images    → public (images voyages)
documents      → privé (docs participants)
payment_proofs → privé (preuves paiement)