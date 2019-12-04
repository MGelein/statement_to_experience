import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()

  // Set the initial board state
  app.get('BoardService').restart()

  await app.listen(3000, () => {
    console.log(`Server listening on localhost:3000`)
    console.log(`Launched on ${new Date()}`)
  })
}

bootstrap()
