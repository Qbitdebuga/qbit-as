FROM docker.elastic.co/logstash/logstash:8.12.1

# Copy configuration files
COPY ./config/logstash/pipeline/ /usr/share/logstash/pipeline/
COPY ./config/logstash/logstash.yml /usr/share/logstash/config/logstash.yml

# Install necessary plugins
RUN logstash-plugin install logstash-input-beats

# Set user to run Logstash as non-root
USER logstash

# Expose the ports Logstash is running on
EXPOSE 5000 5000/udp 5044

# Start Logstash
CMD ["logstash"] 