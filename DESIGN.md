# Design System — FFBC Trip

## IDENTITÉ
Nom : FFBC Trip
Logo : /public/logo.png
Font : Cairo (Google Fonts, weights 400/500/600/700)

## COULEURS
| Nom | Valeur | Usage |
|-----|--------|-------|
| Primary | #0C4149 | Textes, bordures, backgrounds sombres |
| Accent | #FA673E | Boutons CTA, acompte, highlights |
| Accent hover | #FF592A | Hover bouton primary |
| Background | #FAFDFD | Fond de page |
| Surface | #FFFFFF | Cards, modals |
| Success | #0DBF78 | Validé, confirmé |
| Teal | #0DAABF | Accents secondaires |
| Error | #D80012 | Erreurs, annulations |
| Crown | #DFD400 | Icône chef de famille |
| Border | #0C414933 | Bordures légères (20%) |
| Border strong | #0C414980 | Bordures marquées (50%) |
| Text primary | #0C4149 | Texte principal |
| Text muted | #0C4149CC | Texte secondaire |

## SPACING
- Gap entre blocs : 32px
- Padding container : 24px gauche/droite
- Margin top après navbar : 64px
- Padding bottom page : 80px
- Padding interne cards : 20-24px

## BORDER RADIUS
- Cards : 8px
- Boutons : 8px
- Badges : 9999px (full)
- Inputs : 8px

## MAX-WIDTH
- Container principal : 1120px
- Page récap voyage : 640px
- Modals : 560px

## BOUTONS
Primary :
  bg #FA673E, hover #FF592A
  text white, font Cairo 600
  border-radius 8px, height 49px

Secondary :
  bg white, border #0C4149
  text #0C4149, hover bg #0C4149 text white
  border-radius 8px, height 49px

Tertiary :
  bg white, border #0C414933
  text #0C4149
  hover border #0C4149
  border-radius 8px

## INPUTS
- border : 1.5px solid #0C414933
- focus : border #0C4149 + shadow #0C41491A
- error : border #D80012
- border-radius : 8px
- padding : 12px 16px
- font : Cairo regular 16px

## CARDS
- bg : white
- border : 1px solid #0C414933
- border-radius : 8px
- shadow : none

## BADGES STATUTS DOCUMENTS
Validé : bg #0DBF7820, text #0DBF78
En attente : bg #F59E0B20, text #F59E0B
Manquant : bg #D800121A, text #D80012

## STATUTS RÉSERVATION
PRE_RESERVATION : bg orange clair, text orange
CONFIRMEE : bg vert clair, text vert
EXPIREE : bg gris, text gris
ANNULEE : bg rouge clair, text rouge
COMPLETE : bg bleu clair, text bleu

## NAVBAR
- height : 90px
- logo : width 200px, height 61px
- centré horizontalement
- border-bottom : 1px solid #0C414933
- sticky top 0, z-index 100

## ONGLETS DASHBOARD
Actif : border-bottom 4px solid #FA673E
Inactif : border-bottom 4px solid transparent
Font : Cairo medium 14px, color #0C4149