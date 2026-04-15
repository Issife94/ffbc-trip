# Supabase — FFBC Trip

## TABLES

### profiles
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | = auth.users.id |
| email | text | |
| role | enum | client / admin |
| first_name | text | |
| last_name | text | |
| phone | text | |
| created_at | timestamptz | |

### trips
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| title | text | |
| description | text | |
| date_depart | date | |
| date_retour | date | |
| price | integer | centimes |
| capacity | integer | |
| type | enum | famille/adulte/ado |
| image_url | text | |
| is_active | boolean | |

### trip_options
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| trip_id | uuid | FK trips |
| nom | text | |
| description | text | |
| prix | integer | centimes |
| is_featured | boolean | affiché sur récap |
| is_active | boolean | |

### reservations
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| user_id | uuid | FK profiles |
| trip_id | uuid | FK trips |
| status | enum | PRE_RESERVATION/CONFIRMEE/EXPIREE/ANNULEE/COMPLETE |
| total_price | integer | centimes |
| amount_paid | integer | centimes |
| acompte_amount | integer | 35% du total |
| solde_amount | integer | 65% restant |
| nb_participants | integer | |
| is_solo | boolean | partage chambre |
| promo_code | text | FK promo_codes |
| discount_amount | integer | centimes |
| expiration_date | timestamptz | J+10 |
| solde_deadline | timestamptz | départ - 40j |
| contract_signed | boolean | obligatoire pour solder |
| contract_signed_at | timestamptz | |

### participants
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| reservation_id | uuid | FK reservations |
| first_name | text | |
| last_name | text | |
| birth_date | date | |
| phone | text | |
| email | text | |
| address | text | |
| is_organizer | boolean | chef de famille |

### payments
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| reservation_id | uuid | FK reservations |
| amount | integer | centimes |
| method | enum | card/transfer/cheque/ancv |
| status | enum | pending/validated/rejected |
| proof_url | text | storage URL |
| stripe_payment_intent_id | text | |
| ancv_amount | integer | max 50000 (500€) |
| validated_by | uuid | FK profiles admin |
| validated_at | timestamptz | |
| notes | text | |

### documents
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| reservation_id | uuid | FK reservations |
| participant_id | uuid | FK participants |
| type | text | passeport/esta/ast/etc |
| file_url | text | storage URL |
| status | enum | manquant/en_attente/valide |
| validated_by | uuid | FK profiles admin |
| validated_at | timestamptz | |

### option_selections
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| reservation_id | uuid | FK reservations |
| option_id | uuid | FK trip_options |
| quantity | integer | |

### promo_codes
| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid | |
| code | text | unique, ex: FFBCTRIP |
| discount_percent | integer | ex: 10 |
| is_active | boolean | |

## RÈGLES MÉTIER EN DB
- ANCV max 500€ : check ancv_amount <= 50000
- amount_paid <= total_price : constraint
- Contrat signé obligatoire avant solde : vérification Edge Function
- Réservations jamais supprimées : pas de DELETE policy

## CRON JOBS
| Nom | Schedule | Action |
|-----|----------|--------|
| notify-admin-j8 | 0 8 * * * | Email admin si acompte non validé |
| notify-client-j9 | 0 9 * * * | Email client dernière chance |
| expire-reservations-j10 | 0 0 * * * | Passe status → EXPIREE |
| remind-solde-j40 | 0 10 * * * | Email client rappel solde |
| cancel-unpaid-reservations | 0 1 * * * | Passe status → ANNULEE |

## STORAGE
| Bucket | Accès | Usage |
|--------|-------|-------|
| trip_images | public | Images des voyages |
| documents | privé | Documents participants |
| payment_proofs | privé | Preuves de paiement |

## DOCUMENTS PAR TYPE DE VOYAGE
famille/adulte :
  - Passeport
  - ESTA

ado :
  - Passeport
  - ESTA
  - Livret de famille
  - AST (Autorisation de Sortie du Territoire)
  - CNI ou Passeport du parent signataire
  - Copie carnet de santé avec vaccins à jour
  - Fiche sanitaire de liaison