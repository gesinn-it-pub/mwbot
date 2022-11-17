NODE_VERSION ?= 10
MW_VERSION ?= 1.35.8

compose = docker-compose

.PHONY: all
all:

.PHONY: ci
ci: build up test-coverage down

.PHONY: bash
bash:
	$(compose) run --rm mwbot

.PHONY: test-coverage
test-coverage:
	$(compose) run --rm mwbot -c 'npm run test-coverage'

.PHONY: build
build:
	$(compose) build --build-arg NODE_VERSION=$(NODE_VERSION) --build-arg MW_VERSION=$(MW_VERSION)

.PHONY: up
up:
	$(compose) up -d wiki
	$(compose) run --rm wait-for-wiki

.PHONY: down
down:
	$(compose) down
