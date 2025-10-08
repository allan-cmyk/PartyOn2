.PHONY: setup crawl redirects build validate submit all clean

PYTHON := python
VENV := .venv
OUTPUT_DIR := output

setup:
	@echo "📦 Installing dependencies..."
	$(PYTHON) -m pip install --upgrade pip
	$(PYTHON) -m pip install -r requirements.txt
	@echo "✅ Setup complete"

crawl:
	@echo "🕷️  Crawling and merging URLs..."
	$(PYTHON) crawl_and_merge.py
	@echo "✅ Crawl complete"

redirects:
	@echo "🔀 Mapping redirects..."
	$(PYTHON) map_redirects.py
	@echo "✅ Redirects mapped"

build:
	@echo "🏗️  Building sitemaps..."
	$(PYTHON) build_sitemaps.py
	@echo "✅ Sitemaps built"

validate:
	@echo "✔️  Validating sitemaps..."
	$(PYTHON) validate_sitemaps.py
	@echo "✅ Validation complete"

submit:
	@echo "📤 Submitting to search engines..."
	bash submit_search_engines.sh
	@echo "✅ Submission complete"

all: crawl redirects build validate
	@echo ""
	@echo "🎉 All tasks complete!"
	@echo "📋 Next steps:"
	@echo "   1. Review output/validation_report.txt"
	@echo "   2. Upload sitemaps to production"
	@echo "   3. Update robots.txt (see robots_update.txt)"
	@echo "   4. Import redirects.csv to Shopify"
	@echo "   5. Run 'make submit' when live"

clean:
	@echo "🧹 Cleaning output directory..."
	rm -rf $(OUTPUT_DIR)/*
	@echo "✅ Cleaned"
