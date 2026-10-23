import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  // sqlite 文件所在目录必须存在（better-sqlite3 不会自动创建目录）
  const dbPath = resolve(process.env.DB_PATH ?? 'data/app.db')
  mkdirSync(dirname(dbPath), { recursive: true })

  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  // 开发演示：允许任意来源（vite dev 5175 / 局域网手机真机访问）
  app.enableCors({ origin: true })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  )

  const port = Number(process.env.PORT ?? 3000)
  await app.listen(port)
  Logger.log(`API 就绪：http://localhost:${port}/api（DB: ${dbPath}）`, 'Bootstrap')
}

void bootstrap()
