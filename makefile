PLUGIN_DIR := $(shell basename $$(pwd))
PLUGIN_VERSION := $(shell node -p "require('./package.json').version")

DECK_IP := $(shell node -p "require('./.vscode/settings.json').deckip")
DECK_PORT := $(shell node -p "require('./.vscode/settings.json').deckport")
DECK_PASS := $(shell node -p "require('./.vscode/settings.json').deckpass")
DECK_SSH_KEY := $(shell node -p "require('./.vscode/settings.json').deckkey")
DECK_USER_HOMEDIR := $(shell node -p "require('./.vscode/settings.json').deckdir")

BUILD_DIR:= ./build/$(PLUGIN_DIR)-$(PLUGIN_VERSION)/$(PLUGIN_DIR)
ZIP_NAME:= $(PLUGIN_DIR)-$(PLUGIN_VERSION).zip

all: pnpm_setup prepare_dist
pnpm_setup:
	pnpm i	

prepare_dist:
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)
	mkdir $(BUILD_DIR)/dist

	pnpm build
	cp ./dist/index.js $(BUILD_DIR)/dist

	# Misc files
	cp README.md $(BUILD_DIR)
	cp package.json $(BUILD_DIR)
	cp plugin.json $(BUILD_DIR)
	cp LICENSE $(BUILD_DIR)

	# Adding all python files in place
	cp main.py $(BUILD_DIR)
	rsync -avr --prune-empty-dirs \
		--exclude '*_test.py' \
		--exclude '__pycache__' \
		--include '*.py' \
		./defaults/ $(BUILD_DIR)

zip: all
	cd ./build/$(PLUGIN_DIR)-$(PLUGIN_VERSION) && zip -r ../$(ZIP_NAME) ./$(PLUGIN_DIR)

deploy: all create_dir_on_deck fix_permissions1 copy_distr_on_deck fix_permissions2 restart_plugin_loader

create_dir_on_deck:
	ssh deck@$(DECK_IP) -p $(DECK_PORT) $(DECK_SSH_KEY) 'mkdir -p $(DECK_USER_HOMEDIR)/homebrew/pluginloader && mkdir -p $(DECK_USER_HOMEDIR)/homebrew/plugins'

copy_distr_on_deck:
	rsync -azp --delete --rsh='ssh -p $(DECK_PORT) $(DECK_SSH_KEY)' $(BUILD_DIR)/* deck@$(DECK_IP):$(DECK_USER_HOMEDIR)/homebrew/plugins/$(PLUGIN_DIR)

fix_permissions1 fix_permissions2:
	ssh deck@$(DECK_IP) -p $(DECK_PORT) $(DECK_SSH_KEY) 'echo '$(DECK_PASS)' | sudo -S chmod -R 755 $(DECK_USER_HOMEDIR)/homebrew/'

restart_plugin_loader:
	ssh deck@$(DECK_IP) -p $(DECK_PORT) $(DECK_SSH_KEY) 'echo '$(DECK_PASS)' | sudo -S systemctl restart plugin_loader.service'

verify: 
	python3 -m unittest discover -s ./python -p '*_test.py'
	node 'node_modules/jest/bin/jest.js' ./test --silent


