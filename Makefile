NODE_VERSION ?= 20
MW_VERSION ?= 1.43
PHP_VERSION ?= 8.2

export NODE_VERSION
export MW_VERSION
export PHP_VERSION

compose = docker compose

.PHONY: all
all:

.PHONY: ci
ci: build up test-coverage down

.PHONY: bash
bash:
	$(compose) run --rm mwbot

.PHONY: test-coverage
test-coverage:
	$(compose) run --rm mwbot -c 'npm run test:coverage'

.PHONY: build
build:
	$(compose) build wiki mwbot

.PHONY: up
up:
	$(compose) up -d wiki
	$(compose) run --rm wait-for-wiki

.PHONY: down
down:
	$(compose) down
