# Troubleshoot network

```sh
# From the NAS
ip -br addr
ping -c3 192.168.0.1            # gateway (TO_BE_VERIFIED address)
ping -c3 1.1.1.1 && ping -c3 cloudflare.com
sudo ss -ltnp | grep <port>
curl -sI http://127.0.0.1:<port> | head -1
docker network ls; docker network inspect <project>_default | jq '.[0].Containers'
```

| Symptom | Check |
| --- | --- |
| App works on NAS, not from LAN | NAS firewall rules, wrong IP, client on another VLAN (UniFi rules) |
| Container can't reach another project | They're on separate networks; use `192.168.0.119:<port>` or a shared network |
| NAS IP changed | DHCP reservation missing; fix in UniFi and update tunnel routes |
| Device on IoT/Guest can't reach NAS | Expected if VLAN isolation is on; add a specific allow rule |
| Public URL down | [domains/troubleshooting.md](../domains/troubleshooting.md) |
