
# 🚀 Quick Fix : Variables d'Environnement

## ⚡ Solution Rapide (2 minutes)

Vous avez ajouté les variables dans **Supabase Vault** ✅  
Maintenant, ajoutez-les aussi dans **Natively** :

### 1️⃣ Dans Natively
```
⚙️ Settings → Environment Variables → Add New

EXPO_PUBLIC_SUPABASE_URL
https://lnfsjpuffrcyenuuoxxk.supabase.co

EXPO_PUBLIC_SUPABASE_ANON_KEY
[copiez depuis Supabase Dashboard → Settings → API]
```

### 2️⃣ Redémarrez l'App
```
Stop → Start
```

### 3️⃣ Vérifiez
```
Vous devriez voir dans les logs :
✓ Supabase client initialized successfully
```

---

## 🎯 Pourquoi Deux Endroits ?

| Endroit | Pour | Exemple |
|---------|------|---------|
| **Supabase Vault** | Edge Functions (serveur) | Secrets, webhooks |
| **Natively** | React Native App (client) | URLs publiques, clés publiques |

---

## 📍 Où Trouver les Valeurs ?

**Supabase Dashboard** → **Settings** → **API**

```
Project URL → EXPO_PUBLIC_SUPABASE_URL
anon/public → EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## ✅ Checklist

- [ ] Variables ajoutées dans Natively
- [ ] App redémarrée
- [ ] Logs vérifiés
- [ ] App fonctionne !

---

**Besoin d'aide ?** Voir `docs/SUPABASE_VAULT_VS_ENV_VARS.md`
