backend_container_id := $(shell docker ps -aqf name=backend -n 1)
frontend_container_id := $(shell docker ps -aqf name=frontend -n 1)
ollama_container_id := $(shell docker ps -aqf name=ollama -n 1)

backend-sh:
	docker exec -it $(backend_container_id) sh

frontend-sh:
	docker exec -it $(frontend_container_id) sh

ollama-sh:
	docker exec -it $(ollama_container_id) sh

backend-sh-standalone:
	docker compose run --service-ports backend sh

frontend-sh-standalone:
	docker compose run --service-ports frontend sh

ollama-sh-standalone:
	docker compose run --service-ports ollama sh

.PHONY: backend-sh frontend-sh ollama-sh backend-sh-standalone frontend-sh-standalone ollama-sh-standalone