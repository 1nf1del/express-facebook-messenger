test:
	@npm test

example:
	@DEBUG=messenger node example/$(o).js

.PHONY: example test
