# Bezpečnost a známé omezení

Souhrn doložených kontrol z 15. 10. 2026; nejde o penetrační test ani audit externích účtů.

## Závislosti

Projekt používá Next 15.5.28, React 18.3.1, Vitest 4.1.11 a Node 24.x, s přesným PostCSS override 8.5.30 v lockfile. Skutečná čistá instalace při upgradu prošla. ESLint CLI nahradil `next lint`.

- `npm run audit:production`: při zaznamenané kontrole **0** nálezů v produkčních závislostech.
- Úplný `npm audit`: **5 high uzlů jedné dev-only větve**, nikoli pět nezávislých problémů: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`, advisory `GHSA-vfj7-8cjw-p6xm`. Při kontrole nebyla dostupná opravená verze. Větev není produkční runtime, riziko při lintování nedůvěryhodného kódu však zůstává.
- `npm run audit:dependencies` dovoluje pouze tuto přesnou dev-only větev do **2026-11-15**. Nový problém, produkční expozice, nedostupný audit nebo konec výjimky blokují CI. Úplný audit není čistý.

[Uložený audit](../output/security/npm-audit-after-2026-10-15.json) je časový snapshot, nikoli záruka současného stavu registru.

## Tajné údaje a data

- Gitleaks 8.30.1 zkontroloval celou dostupnou Git historii a aktuální soubory; po review žádné nevyřešené nálezy. `.gitleaksignore` obsahuje jediný přesný historický fingerprint neplatného ukázkového klíče, nikoli obecné výjimky pro soubory.
- `npm run check:secret-exposure` hledá skutečná lokálně nastavená tajemství doslova i v Base64 v dostupných Git blobs, souborech a `.next/static`. Poslední kontrola nenašla shodu. Hodnoty ani hashe se nevypisují; bez lokálního klíče se jeho kontrola neprokazuje.
- `.env*` jsou ignorovány kromě `.env.example`. Serverový secret key nesmí mít prefix `NEXT_PUBLIC_`.
- Kontakty jsou přístupné serveru, ne anonymnímu klientovi. Ochranu tvoří RLS, omezená práva RPC, validace, honeypot, kontrola Origin/Content-Type/velikosti těla a atomický rate limit. Test textu migrace sám neprokazuje živá oprávnění.

## Automatizace a důkazy

[Workflow](../.github/workflows/security.yml) běží při push/PR, ručně a týdně. Má read-only oprávnění, úplnou historii, akce připnuté na SHA a kontrolu SHA256 staženého Gitleaks. Produkční tajemství nepotřebuje.

- Security publikace `99cebb1`: Vercel READY, [CI success](https://github.com/Svitovan/etf-landing-page/actions/runs/38747428905).
- Poslední ověřený aplikační kód `e2353e9`: [CI success](https://github.com/Svitovan/etf-landing-page/actions/runs/38750577133), včetně celé historie a 118 testů.
- [Souhrn důkazů](../output/security/security-evidence-2026-10-15.json).
- [Production smoke na 99cebb1](../output/security/production-smoke-99cebb1.json): landing/report 200, `.env` a package-lock 404, neplatné tělo 400, cizí Origin 403; bez vytvoření kontaktu.

Detekce podle vzorů a přesná kontrola lokálně dostupných hodnot nejsou zárukou absence všech tajemství. Nedostupné refs, cizí klony a externí účty nebyly kontrolovány.
