import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Impor ValidationPipe
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    {
      rawBody: true,
    }
  );
    // app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // --- 2. TAMBAHKAN BARIS INI ---
  // Terapkan ValidationPipe secara global ke seluruh aplikasi
  app.useGlobalPipes(new ValidationPipe());
  // -----------------------------

  app.enableCors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      `https://popupalerts.com/`,
      'http://popupalerts.com',
      'https://mochafolk.com',
      'http://127.0.0.1:5500',
      null,            // <-- important
      'null',          // <-- some browsers send literal string
      '*'              // <-- optional, for public widget APIs
    ];

    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});


  // app.enableCors();
  await app.listen(3000);
}
bootstrap();