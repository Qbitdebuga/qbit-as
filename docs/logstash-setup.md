# Logstash Configuration for Qbit Accounting System

## Overview

Logstash is a server-side data processing pipeline that ingests data from multiple sources simultaneously, transforms it, and then sends it to Elasticsearch. In the Qbit Accounting System, Logstash is a critical component of our centralized logging infrastructure, enabling the collection, processing, and enrichment of logs from all microservices.

## Configuration Details

### Docker Setup

The Logstash service is configured in the `docker-compose.yml` file with the following settings:

```yaml
logstash:
  image: docker.elastic.co/logstash/logstash:7.14.0
  container_name: qbit_logstash
  environment:
    - ES_JAVA_OPTS=-Xms256m -Xmx256m
    - XPACK_MONITORING_ELASTICSEARCH_HOSTS=http://elasticsearch:9200
  volumes:
    - ./config/logstash/pipeline:/usr/share/logstash/pipeline
  depends_on:
    - elasticsearch
  networks:
    - qbit_network
  ports:
    - "5044:5044"  # Beats input
    - "5000:5000/tcp"  # TCP input
    - "5000:5000/udp"  # UDP input
    - "9600:9600"  # API endpoint
```

### Pipeline Configuration

The Logstash pipeline configuration (`config/logstash/pipeline/logstash.conf`) defines how logs are processed:

```
input {
  tcp {
    port => 5000
    codec => json
  }
  udp {
    port => 5000
    codec => json
  }
  beats {
    port => 5044
  }
}

filter {
  if [service] {
    mutate {
      add_field => { "[@metadata][target_index]" => "logs-%{service}-%{+YYYY.MM.dd}" }
    }
  } else {
    mutate {
      add_field => { "[@metadata][target_index]" => "logs-default-%{+YYYY.MM.dd}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["${ELASTICSEARCH_HOST:elasticsearch:9200}"]
    index => "%{[@metadata][target_index]}"
  }
  stdout {
    codec => rubydebug
  }
}
```

### Main Configuration (logstash.yml)

The main Logstash configuration file (`config/logstash/logstash.yml`) contains general settings:

```yaml
http.host: "0.0.0.0"
xpack.monitoring.enabled: true
xpack.monitoring.elasticsearch.hosts: ["${ELASTICSEARCH_URL}"]
path.config: /usr/share/logstash/pipeline
config.reload.automatic: true
config.reload.interval: 30s
log.level: info
pipeline.workers: 2
pipeline.batch.size: 125
pipeline.batch.delay: 50
queue.type: memory
```

## Key Features

1. **Multiple Input Sources**: Accepts logs from TCP/UDP streams (JSON formatted) and Filebeat.
2. **Service-Based Indexing**: Dynamically routes logs to different Elasticsearch indices based on the service name.
3. **Automatic Configuration Reload**: Configuration changes are automatically detected and applied without restart.
4. **Pipeline Workers**: Configured with 2 worker threads for parallel processing to handle high log volumes.
5. **Debug Output**: All processed logs are also output to stdout with rubydebug codec for easy troubleshooting.

## Integration with Microservices

### Logging Service Logs

To send logs from a NestJS microservice to Logstash:

```typescript
// Example with winston logger in a NestJS service
import { createLogger, format, transports } from 'winston';
import * as winston from 'winston';

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'auth-service' }, // Important: Add service name
  transports: [
    new transports.Console(),
    // Add Logstash transport
    new winston.transports.Http({
      host: 'logstash',
      port: 5000,
      path: '/',
      ssl: false
    })
  ]
});

// Usage
logger.info('User authenticated', { userId: '123', action: 'login' });
```

### Log Format Guidelines

For consistent log processing, all microservices should:

1. Include a `service` field to identify the source service
2. Use JSON formatting for all logs
3. Include standard fields:
   - `timestamp`: ISO format date/time
   - `level`: Log level (info, error, warn, debug)
   - `message`: The log message
   - `context`: The class/component generating the log

## Kibana Dashboards

After logs are processed by Logstash and stored in Elasticsearch, they can be visualized in Kibana. Pre-configured dashboards are available for:

- Service health monitoring
- Error tracking
- User activity analysis
- Transaction processing metrics

## Troubleshooting

- **Check Logstash status**: Access the Logstash API at http://localhost:9600/_node/stats
- **View pipeline metrics**: http://localhost:9600/_node/stats/pipelines
- **Debug configuration issues**: Check logs with `docker-compose logs logstash`
- **Test TCP connectivity**: Use netcat to send test messages: `echo '{"message":"test", "service":"test-service"}' | nc localhost 5000`

## Administration Tasks

### Updating Logstash Configuration

1. Edit the configuration file at `config/logstash/pipeline/logstash.conf`
2. The configuration will be automatically reloaded (no restart required)

### Adding Filters

To add a new filter for parsing specific log formats:

1. Edit the `filter` section in `config/logstash/pipeline/logstash.conf`
2. Add conditional processing with the appropriate grok patterns or filter plugins
3. The changes will be applied after the configured reload interval (30s)

## Next Steps

The next phases of our logging infrastructure implementation include:

1. Adding log correlation with request IDs across services
2. Setting up log retention policies
3. Configuring alerts based on log patterns
4. Implementing log-based metrics for service performance monitoring 