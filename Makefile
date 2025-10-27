# Port Check Version Management Makefile

# Package files
MAIN_PACKAGE = package.json
ALIAS_PACKAGE = alias-port-check/package.json

# Helper function to get current version
GET_VERSION = $(shell node -p "require('./$(MAIN_PACKAGE)').version")

# Helper function to update version in package.json
UPDATE_VERSION = node -e "const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('$(1)', 'utf8')); pkg.version = '$(2)'; fs.writeFileSync('$(1)', JSON.stringify(pkg, null, 2) + '\n');"

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make push fix   - Increment patch version (1.0.8 -> 1.0.9)"
	@echo "  make push minor - Increment minor version (1.0.8 -> 1.1.0)"
	@echo "  make push major - Increment major version (1.0.8 -> 2.0.0)"

# Version bump targets
.PHONY: push-fix
push-fix:
	@echo "Bumping patch version..."
	@$(MAKE) bump-version TYPE=patch

.PHONY: push-minor
push-minor:
	@echo "Bumping minor version..."
	@$(MAKE) bump-version TYPE=minor

.PHONY: push-major
push-major:
	@echo "Bumping major version..."
	@$(MAKE) bump-version TYPE=major

# Internal target to handle version bumping
.PHONY: bump-version
bump-version:
	@if [ "$(TYPE)" = "" ]; then \
		echo "Error: TYPE must be specified (patch, minor, or major)"; \
		exit 1; \
	fi
	@CURRENT_VERSION=$$(call GET_VERSION); \
	echo "Current version: $$CURRENT_VERSION"; \
	IFS='.' read -r MAJOR MINOR PATCH <<< "$$CURRENT_VERSION"; \
	if [ "$(TYPE)" = "patch" ]; then \
		NEW_VERSION="$$MAJOR.$$MINOR.$$((PATCH + 1))"; \
	elif [ "$(TYPE)" = "minor" ]; then \
		NEW_VERSION="$$MAJOR.$$((MINOR + 1)).0"; \
	elif [ "$(TYPE)" = "major" ]; then \
		NEW_VERSION="$$((MAJOR + 1)).0.0"; \
	else \
		echo "Error: Invalid TYPE. Must be patch, minor, or major"; \
		exit 1; \
	fi; \
	echo "New version: $$NEW_VERSION"; \
	$(call UPDATE_VERSION,$(MAIN_PACKAGE),$$NEW_VERSION); \
	$(call UPDATE_VERSION,$(ALIAS_PACKAGE),$$NEW_VERSION); \
	echo "Updated package.json files"; \
	git add $(MAIN_PACKAGE) $(ALIAS_PACKAGE); \
	git commit -m "Bump version to $$NEW_VERSION"; \
	git tag "v$$NEW_VERSION"; \
	echo "Created tag: v$$NEW_VERSION"; \
	git push origin "v$$NEW_VERSION"; \
	echo "Pushed tag v$$NEW_VERSION to origin"

# Alias targets for convenience
.PHONY: push
push: push-fix

# Clean up any temporary files
.PHONY: clean
clean:
	@echo "No temporary files to clean"
