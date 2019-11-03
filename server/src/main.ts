import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Initial board state
  app.get('BoardService').update([
    [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
    ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
    [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
    ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
    ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
    [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
    ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
  ])

  await app.listen(3000, () => {
    console.log(`Server listening on localhost:3000`)
    console.log(`Launched on ${new Date()}`)
  })
}

bootstrap()
