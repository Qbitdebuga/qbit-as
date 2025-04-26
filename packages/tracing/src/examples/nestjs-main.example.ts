/**
 * This is an example file showing how to integrate OpenTelemetry tracing
 * with a NestJS application. You would adapt this to your specific needs.
 * 
 * Note: This is a simple example and doesn't include actual NestJS imports
 * as they would depend on your specific project setup.
 */

import { initTracer } from '../tracer';

async function bootstrap() {
  // Initialize the tracer before creating the app
  // This ensures that all requests, including those during app creation, are traced
  initTracer({
    serviceName: process.env.SERVICE_NAME || 'your-service-name',
    jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
    environment: process.env.NODE_ENV || 'development',
  });
  
  // In your real application, you would create your NestJS app here
  // and continue with your normal setup process
  
  console.log('Tracer initialized successfully');
  
  // Example of what your NestJS bootstrap would look like:
  /*
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  
  // Add the TracingMiddleware to your application
  const configService = app.get(ConfigService);
  app.use(new TracingMiddleware());
  
  // Start your server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
  */
}

// In a real application, you would call bootstrap() here
bootstrap().catch(err => {
  console.error('Error bootstrapping application:', err);
}); 