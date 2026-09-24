#!/usr/bin/env python3
"""Install checksum-pinned plugins and Geyser config into a stopped deployment."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import tempfile
import time
import urllib.request

p = argparse.ArgumentParser(description=__doc__)
p.add_argument("deployment", type=Path)
args = p.parse_args()
source = Path(__file__).resolve().parent
live = args.deployment.resolve()
plugins = live / "data/plugins"
if not (live / "data/server.properties").is_file():
    raise SystemExit("Expected an existing Name Pending deployment")
entries = json.loads((source / "plugins.lock.json").read_text())
with tempfile.TemporaryDirectory() as temp:
    stage = Path(temp)
    for entry in entries:
        data = urllib.request.urlopen(entry["url"], timeout=120).read()
        if hashlib.sha256(data).hexdigest() != entry["sha256"]:
            raise SystemExit("Checksum mismatch: " + entry["name"])
        (stage / entry["name"]).write_bytes(data)
    backup = live / "backups" / ("bedrock-" + str(time.time_ns()))
    backup.mkdir(parents=True)
    for pattern in ("ViaVersion*.jar", "Geyser-Spigot*.jar", "floodgate-spigot*.jar"):
        for old in plugins.glob(pattern):
            shutil.move(str(old), backup / old.name)
    config = plugins / "Geyser-Spigot/config.yml"
    config.parent.mkdir(exist_ok=True)
    if config.exists():
        shutil.copy2(config, backup / "geyser-config.yml")
    shutil.copy2(live / "docker-compose.yml", backup / "docker-compose.yml")
    for entry in entries:
        shutil.copy2(stage / entry["name"], plugins / entry["name"])
    shutil.copy2(source / "geyser.yml", config)
    shutil.copy2(source.parent / "docker-compose.yml", live / "docker-compose.yml")
    print("Installed pinned plugins. Backup:", backup)
