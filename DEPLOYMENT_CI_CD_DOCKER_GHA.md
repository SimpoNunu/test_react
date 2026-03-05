## Guide de déploiement CI/CD Docker + GitHub Actions

Ce document décrit tout le parcours de déploiement mis en place pour `test_react`. Tu peux le réutiliser comme modèle pour d'autres projets.

---

### 1. Préparation du dépôt GitHub

- **Dépôt**: `SimpoNunu/test_react`
- **Branche principale**: `main`
- **Technos**: Next.js + TypeScript

#### 1.1. Fichiers clés

- `Dockerfile`: image Docker de l’app Next.js.
- `docker-compose.yml`: description du service sur le serveur.
- `.github/workflows/ci.yaml`: pipeline CI/CD GitHub Actions.
- `next.config.ts`: configuration Next (avec option pour ignorer les erreurs TypeScript au build).

---

### 2. Dockerisation de l’application

#### 2.1. Dockerfile (build + run)

Objectif :

- Étape **builder** : installer les dépendances + `npm run build`.
- Étape **runner** : exécuter l’app en production.

Principe :

- `FROM node:20-alpine AS builder`
  - `WORKDIR /app`
  - `COPY . .`
  - `RUN npm install && npm run build`
- `FROM node:20-alpine AS runner`
  - `WORKDIR /app`
  - `ENV NODE_ENV=production`
  - `COPY` des artefacts du build (`.next`, `node_modules`, `public`, etc.)
  - `EXPOSE 3000`
  - `CMD ["npm", "run", "start"]`

#### 2.2. docker-compose.yml (sur le serveur)

Rôle : lancer le container avec la bonne image et exposer le port.

Exemple utilisé :

```yaml
services:
  web:
    image: ghcr.io/simponunu/test_react:latest
    container_name: boutique-next
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.production
```

- L’image suit le schéma `ghcr.io/<compte_github>/<nom_du_repo>:latest`.
- `env_file` contient les variables d’environnement de production.

---

### 3. Préparation du serveur (Ubuntu)

#### 3.1. Installation de Docker + Docker Compose

1. Installer Docker et le plugin `docker compose` (méthode officielle Docker).
2. Ajouter l’utilisateur (ici `simpo`) au groupe `docker` pour éviter `sudo` :

```bash
sudo usermod -aG docker simpo
```

Puis se déconnecter / reconnecter.

#### 3.2. Cloner le projet sur le serveur

```bash
cd /home/simpo
git clone https://github.com/SimpoNunu/test_react.git
cd test_react
```

#### 3.3. Fichier d’environnement

```bash
cd /home/simpo/test_react
touch .env.production
```

Ou copier un fichier existant :

```bash
cp .env .env.production
```

---

### 4. Authentification GitHub et GHCR

#### 4.1. Git côté poste de développement

But : pouvoir pousser sur `SimpoNunu/test_react`.

1. Créer un **Personal Access Token (PAT)** sur GitHub (compte `SimpoNunu`) avec le scope **`repo`**.
2. Supprimer les anciennes identifiants GitHub dans le **Gestionnaire d’identification Windows**.
3. Pousser :

```bash
git push origin main
```

Quand Git le demande :

- **Nom d’utilisateur**: `SimpoNunu`
- **Mot de passe**: le **PAT**.

#### 4.2. GHCR côté serveur

But : que `docker compose pull` puisse lire les images.

1. Créer un **PAT** GitHub (compte `SimpoNunu`) avec au moins le scope **`read:packages`**.
2. Sur le serveur :

```bash
echo TON_TOKEN_GHCR | docker login ghcr.io -u SimpoNunu --password-stdin
```

On doit voir `Login Succeeded`.

---

### 5. Pipeline GitHub Actions (`.github/workflows/ci.yaml`)

#### 5.1. Objectif du workflow

Sur chaque **push sur `main`** :

1. Construire l’image Docker.
2. Pousser l’image vers **GitHub Container Registry** (`ghcr.io`).
3. Se connecter en SSH au serveur.
4. Lancer `docker compose pull && docker compose up -d`.

#### 5.2. Déclencheur

```yaml
on:
  push:
    branches: [ main ]
```

#### 5.3. Variables globales

```yaml
env:
  REGISTRY: ghcr.io
```

Le nom d’image est construit plus bas en minuscules.

#### 5.4. Étapes principales

- **Checkout** du code :

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

- **Nom d’image en minuscules** (Docker impose un repo en minuscules) :

```yaml
- name: Set image name (lowercase)
  run: echo "IMAGE_NAME=ghcr.io/${GITHUB_REPOSITORY,,}" >> $GITHUB_ENV
```

- **Login à GHCR** (côté GitHub Actions) :

```yaml
- name: Log in to GitHub Container Registry
  run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u "${{ github.actor }}" --password-stdin
```

- **Build de l’image Docker** :

```yaml
- name: Build Docker image
  run: docker build -t "$IMAGE_NAME:latest" .
```

- **Push de l’image vers GHCR** :

```yaml
- name: Push Docker image
  run: docker push "$IMAGE_NAME:latest"
```

- **Configuration SSH** (clé privée du serveur en secret GitHub `SSH_PRIVATE_KEY_SIMPO`) :

```yaml
- name: Setup SSH
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY_SIMPO }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan 172.189.185.50 >> ~/.ssh/known_hosts
```

- **Déploiement via SSH + Docker Compose** :

```yaml
- name: Deploy via SSH (docker compose)
  run: |
    ssh simpo@172.189.185.50 << EOF
      cd /home/simpo/test_react
      sed -i "s@ghcr.io/.*/test_react:latest@${IMAGE_NAME}:latest@g" docker-compose.yml
      docker compose pull
      docker compose up -d
    EOF
```

---

### 6. Particularités Next.js / TypeScript

Lors du premier build Docker, `next build` a échoué à cause d’une erreur de typage TypeScript dans une route (`app/api/product/[id]/route.ts`).

Pour ne pas bloquer le déploiement, la config Next a été ajustée dans `next.config.ts` :

```ts
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};
```

**Idée** : pour un projet “propre”, il faudra corriger les types puis retirer `ignoreBuildErrors: true`.

---

### 7. Premier déploiement manuel sur le serveur

Après un workflow GitHub Actions réussi (toutes les étapes vertes, surtout **Push Docker image**) :

Sur le serveur :

```bash
cd /home/simpo/test_react
docker compose pull
docker compose up -d
docker ps
```

Vérifier :

- Un container `boutique-next` (ou équivalent) doit être **Up**.
- Le port doit être exposé : `0.0.0.0:3000->3000/tcp`.

Dans le navigateur (machine locale) :

- Aller sur `http://172.189.185.50:3000`.

---

### 8. Fonctionnement du CI/CD au quotidien

1. Développement local dans `test_react`.
2. `git add`, `git commit`, `git push origin main`.
3. GitHub Actions :
   - construit l’image Docker,
   - pousse sur `ghcr.io`,
   - se connecte au serveur,
   - exécute `docker compose pull && docker compose up -d`.
4. Le serveur tire la nouvelle image et redémarre le container.
5. L’URL `http://172.189.185.50:3000` sert la nouvelle version.

---

### 9. Réutiliser ce modèle pour d’autres projets

Pour un nouveau projet :

1. **Créer un nouveau dépôt GitHub**.
2. Ajouter / adapter :
   - `Dockerfile` (build de l’app),
   - `docker-compose.yml` (nom du service, ports, image),
   - `.github/workflows/ci.yaml` (chemins serveur, IP, utilisateur, nom du repo).
3. Sur le serveur :
   - installer Docker,
   - cloner le repo dans `/home/<user>/<nom_repo>`,
   - préparer `.env.production`,
   - se connecter à GHCR (`docker login ghcr.io ...`).
4. Sur GitHub :
   - créer les secrets (clé SSH du serveur, éventuellement autres secrets).
5. Lancer un premier `git push` sur `main` et vérifier le workflow.

Ce fichier peut servir de **modèle générique** : il suffit de remplacer les noms (`test_react`, `simponunu`, IP, chemins) pour d’autres projets.

