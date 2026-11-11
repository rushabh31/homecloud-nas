# Troubleshoot SSL/TLS

```sh
curl -svI https://<host> 2>&1 | grep -E 'subject|issuer|expire|HTTP/'
echo | openssl s_client -connect <host>:443 -servername <host> 2>/dev/null | openssl x509 -noout -issuer -dates
```

| Symptom | Fix |
| --- | --- |
| Cert issuer is Cloudflare, browser happy, app redirect loop | Turn off Force SSL in NPM / app; trust `X-Forwarded-Proto` |
| `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` on a sub-sub-domain | Universal SSL covers `*.example.com` only one level deep; use one level or Advanced Certificate |
| 526 Invalid SSL certificate | Origin is HTTPS with a bad cert and mode is Full (strict); use HTTP origin via tunnel or set noTLSVerify |
| NPM Let's Encrypt fails | HTTP challenge can't work (no open ports); use DNS challenge with a Cloudflare token |
| UGOS 9443 warning | Self-signed; expected on LAN |
