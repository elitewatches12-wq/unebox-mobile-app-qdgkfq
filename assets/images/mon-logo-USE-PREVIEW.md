J'ai généré des sources vectorielles (SVG) à partir de l'aperçu que tu as fourni et ajouté un script pour convertir ces SVG en PNG.

Remarques importantes:
- Ces SVG ont été créés automatiquement en s'appuyant sur l'aperçu et peuvent différer légèrement du logo original; ils sont vectoriels et donc scalables, ce qui minimise la perte de qualité quand on génère des PNG.
- Les PNG finaux (1024×1024 pour l'App Store, 2732×2732 pour le splash) doivent être exportés depuis ces SVG avec un outil comme inkscape ou rsvg-convert pour garantir la qualité.
- Le script assets/images/generate-pngs.sh convertira les SVG en PNGs et placera les images dans dist/. Exécute: bash assets/images/generate-pngs.sh

Étapes suivantes que je peux faire pour toi:
- Exécuter les conversions et pousser les PNGs directement si le runner pouvait exécuter des binaires (actuellement je ne peux pas exécuter de commandes natives ici). Tu peux exécuter le script localement ou sur CI pour générer PNGs.
- Une fois que les PNGs sont présents dans assets/images/, je peux commit/push ces images et créer la Pull Request feature/replace-natively-logo → main.