# 🔄 Sistema de Copias de Seguridad Diarias

**Fecha de configuración:** 15 de abril de 2026  
**Configurado por:** Antigravity AI Assistant

---

## ¿Qué hace?

Cada día a las **9:00 AM**, el Mac crea automáticamente una "foto" (tag de Git) del estado de ambos proyectos del día anterior. Se guardan los últimos **7 días** de copias.

---

## Proyectos protegidos

| Proyecto | Dominio | Repo GitHub |
|----------|---------|-------------|
| IA de Barrio | iadebarrio.com | `gerard-iartesana/IA-Visionary-AppleStyle` |
| Gerard Fanals | gerardfanals.online | `gerard-iartesana/gerard-fanals-web` |

---

## Ubicación de los archivos

| Archivo | Ruta |
|---------|------|
| **Script de backup** | `/Users/gerard/Documents/GitHub/trabajos-antigravity-2026/scripts/daily-backup.sh` |
| **Servicio macOS** | `/Users/gerard/Library/LaunchAgents/com.antigravity.daily-backup.plist` |
| **Log de ejecuciones** | `/Users/gerard/Documents/GitHub/trabajos-antigravity-2026/scripts/backup.log` |

---

## Cómo funciona

1. A las 9:00 AM, macOS ejecuta el script automáticamente (launchd)
2. El script crea un **tag de Git** con el nombre `backup-YYYY-MM-DD` (fecha de ayer)
3. El tag se sube también a GitHub como copia remota
4. Los tags de más de 7 días se borran automáticamente
5. No ocupa espacio extra (Git ya tiene los datos, el tag es solo una etiqueta)

---

## Cómo ver las copias disponibles

Abrir Terminal y ejecutar:

```bash
# Ver copias de iadebarrio.com
cd ~/Documents/GitHub/trabajos-antigravity-2026
git tag | grep backup

# Ver copias de gerardfanals.online
cd ~/Documents/GitHub/trabajos-antigravity-2026/gerard-fanals-web
git tag | grep backup
```

---

## Cómo recuperar una copia de un día concreto

### Opción 1: Solo ver cómo estaba (sin tocar nada)
```bash
# Ir a la carpeta del proyecto
cd ~/Documents/GitHub/trabajos-antigravity-2026

# Ver el estado del día 14 de abril
git checkout backup-2026-04-14

# IMPORTANTE: Volver al presente cuando termines
git checkout main
```

### Opción 2: Restaurar un archivo concreto de otro día
```bash
# Recuperar solo el admin.html del día 14
git checkout backup-2026-04-14 -- admin.html
```

### Opción 3: Restaurar TODO al estado de otro día (⚠️ destructivo)
```bash
# CUIDADO: esto sobrescribe todo el código actual
git checkout backup-2026-04-14 -- .
git commit -m "Restaurado al estado del 14 de abril"
```

---

## Cómo ejecutar el backup manualmente

Si quieres crear una copia ahora mismo sin esperar a las 9:00 AM:

```bash
bash ~/Documents/GitHub/trabajos-antigravity-2026/scripts/daily-backup.sh
```

---

## Cómo ver el historial de backups realizados

```bash
cat ~/Documents/GitHub/trabajos-antigravity-2026/scripts/backup.log
```

Ejemplo de salida:
```
=== Backup 2026-04-15 20:03:45 ===
[iadebarrio] Created tag backup-2026-04-14
[gerardfanals] Created tag backup-2026-04-14
=== Done ===
```

---

## Cómo desactivar el backup automático

```bash
launchctl unload ~/Library/LaunchAgents/com.antigravity.daily-backup.plist
```

## Cómo reactivarlo

```bash
launchctl load ~/Library/LaunchAgents/com.antigravity.daily-backup.plist
```

---

## Contexto: Incidente del 15 de abril de 2026

Este sistema se configuró después de un incidente donde el contenido de `iadebarrio.com` se desplegó accidentalmente en `gerardfanals.online`. La causa fue un remote de Git (`vercel`) configurado en el repo equivocado que hizo push del contenido de un proyecto al otro.

### Acciones correctivas realizadas:
1. ✅ Force push para restaurar el contenido correcto en `gerard-fanals-web`
2. ✅ Eliminación del remote `vercel` del repo de iadebarrio para evitar confusiones
3. ✅ Verificación de ambas webs en producción
4. ✅ Configuración de este sistema de backups diarios
