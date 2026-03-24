# Travel Agency Process Wiki — CLAUDE.md

## Project
OTA + TMC business process wiki for SAP consulting.
Reference: Expedia Group (OTA) + Amex GBT / SAP Concur (TMC)

## HARD CONSTRAINTS
1. mmdc: `%%{init: {'theme':'base',...}}%%` ONLY — never `---config: layout: elk---`
2. Diagrams: mmdc CLI → PNG. HTML uses `<img src="assets/img/pid.png">`. No mermaid div.
3. Node IDs: start with a letter (NodeA, S1_1). Never 1.1.
4. Arrows: always `-->` never `--gt`
5. mmdc command: `mmdc -i diagrams/pid.mmd -o assets/img/pid.png -w 1920 -H 1080 --scale 2 --backgroundColor white`
6. Excel: Index + per-process tabs + Master Catalog
7. Wiki link: only after HTTP 200 + content verify. sleep(90) after push.
8. Index pages: push ALL L1 + L2 after every process
9. processes.json: local only — never push to GitHub
10. `.deploy` as final commit after bulk pushes

## Resume
`python3 scripts/generate_travel_wiki.py --start OB-BK-03`

## Stats
168 processes · 9 L1 domains · 5 EA diagrams
