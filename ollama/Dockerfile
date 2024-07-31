# FROM ollama/ollama:0.1.46 AS builder

# RUN apt-get update && apt-get install -y netcat

# COPY <<EOF entrypoint.sh
# /bin/ollama serve &
# pid=$!

# while ! nc -z localhost 11434; do
#     echo "Waiting for Ollama service to start..."
#     sleep 1
# done

# echo "Retrieving granite3b model..."
# ollama pull granite-code:3b
# echo "Done!"

# wait $pid
# EOF

# RUN chmod +x entrypoint.sh

# ENTRYPOINT ["/usr/bin/bash", "entrypoint.sh"]

FROM ollama/ollama:latest

# COPY --from=builder /root/.ollama /root/.ollama

ENTRYPOINT ["ollama", "serve"]

WORKDIR /root/.ollama

EXPOSE 11434