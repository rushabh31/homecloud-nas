.PHONY: check validate docs drift

check: validate docs

validate:
	bash scripts/validate-compose.sh

docs:
	python3 scripts/check_docs.py

drift:
	python3 scripts/detect-drift.py --discovered reports/discovered-latest.json
