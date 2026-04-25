# Moodgallery

Application web locale pour composer une galerie visuelle avec deplacement automatique horizontal et boucle continue.

## Apercu

Moodgallery permet de:

- importer plusieurs images par drag-and-drop ou selection de fichiers;
- afficher les images dans un layout type moodboard;
- faire defiler automatiquement la galerie avec une vitesse reglable;
- mettre en pause/reprendre l animation;
- personnaliser la couleur de fond via sliders HSL ou saisie HEX;
- reinitialiser la galerie ou les parametres visuels.

## Fonctionnalites

### Upload

- zone de drop plein ecran au lancement;
- prise en charge des fichiers `image/*`;
- ajout multiple;
- extraction automatique d une couleur dominante a partir de la premiere image.

### Galerie

- defilement horizontal automatique;
- logique de boucle infinie par recyclage dynamique des elements;
- placeholders et compteurs de chargement;
- hover visuel sur les images.

### Controles

- `Pause` (egalement touche `Espace`);
- `Reinitialiser` (vide la galerie);
- `Reinit Param` (remet la vitesse et la couleur par defaut);
- slider de vitesse (`0.1x` a `2.0x`);
- controles couleur: Hue, Saturation, Lightness, HEX.

## Utilisation

1. Ouvrir `index.html` dans un navigateur moderne.
2. Deposer des images ou cliquer sur la zone d upload.
3. Ajuster la vitesse et la couleur avec le panneau de controles.
4. Utiliser `Pause` pour figer/reprendre l animation.

## Structure du projet

```text
LCDR-Galery/
|-- index.html
|-- styles.css
|-- app.js
`-- README.md
```

## Details techniques

- Application 100% front-end, sans backend.
- Lecture locale des images via `FileReader`.
- Aucun envoi serveur.
- Animation pilotee par `requestAnimationFrame`.

## Compatibilite

- Chrome / Edge recents
- Firefox recent
- Safari recent

## Notes

- Les images sont conservees en memoire pendant la session.
- En cas de comportement visuel incoherent apres modifications, faire un rechargement force (`Ctrl+F5`).
