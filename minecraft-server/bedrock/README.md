# Bedrock access

On iPad, add server address `np.hanasand.com` and port `443`.
Current iPad Bedrock uses NetherNet. Geyser accepts its WebRTC traffic on UDP
19132; built-in signaling uses internal TCP 19132, published only on loopback.
OpenResty serves `/v1/join` over HTTP and HTTPS on `np.hanasand.com:443`.
Its shared TCP listener distinguishes plaintext HTTP, TLS, and Java Minecraft.
The public UDP port and the internal WebRTC port must both be 19132, because
Geyser advertises the public address through `geyserAdvertiseAddresses`.
UDP 443 is blocked upstream. UDP 19132 was verified with three successful
round trips from the separate OVH host (192.99.32.185), not the local Mac,
which reaches Inspur from a private network. No external signaling provider
or upstream firewall change is needed.

OpenResty's companion configuration is tracked in the openresty repository:
`nginx/conf/nginx.conf` and `nginx/conf.d/bedrock.conf`.
Deploy that routing with this configuration. RakNet-only clients are not
supported on this endpoint; RakNet and NetherNet cannot share one UDP listener.

Geyser 2.11.3 build 1245 and Floodgate 2.2.5 build 141 are pinned alongside
ViaVersion 5.12.0 in plugins.lock.json. Downloads are checksum verified.
Update these pins when a new Bedrock client requires a newer Geyser release.

Floodgate authenticates Bedrock accounts; Java online authentication stays on.
Secure-profile enforcement is disabled because Bedrock accounts cannot provide
Java chat signatures. Floodgate keys and player data stay in the ignored data
directory. Unlinked Bedrock accounts have separate player inventories; use
Floodgate account linking to share an existing Java player identity.
Keep the whitelist enabled. Add Bedrock accounts with `fwhitelist add GAMERTAG`;
if its lookup cannot resolve the account, use the authenticated Floodgate UUID.

Deploy from `~/name_pending/minecraft-server` (tracked in the parent Name Pending project):
```sh
cd /home/hanasand/name_pending/minecraft-server
docker exec name_pending_server rcon-cli list
# Wait until no players are online before this planned restart.
docker compose -f /home/hanasand/name_pending_server/docker-compose.yml stop minecraft
python3 bedrock/install.py /home/hanasand/name_pending_server
docker compose -f /home/hanasand/name_pending_server/docker-compose.yml up -d minecraft
docker exec name_pending_server rcon-cli "geyser version"
```

The installer backs up replaced plugins, Geyser config, and Compose in the live
deployment's backups directory. It preserves worlds and other plugins.
Commit source changes in the parent Name Pending project; the live deployment remains at /home/hanasand/name_pending_server.

Run `python3 bedrock/check.py` from outside Inspur to check HTTP/HTTPS signaling
and rejection of invalid authentication. An authenticated iPad join verifies
UDP/WebRTC and gameplay. Also check Java routes, HTTPS, and Cashflow SSH.
