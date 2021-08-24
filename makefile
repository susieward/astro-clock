
run:
	uvicorn app.main:app --reload


rebuild:
	cd app/static && \
	npm run build && \
	cd ../../
