
run:
	uvicorn app.api.main:app --reload


build:
	cd app/static && \
	npm run build && \
	cd ../../


serve:
	cd app/static && \
	npm run serve
