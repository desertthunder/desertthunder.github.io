.PHONY: dev preview

dev:
	@echo "Starting dev server"
	@hugo server --buildDrafts --verbose

preview:
	@echo "Starting preview server"
	@hugo server --verbose
