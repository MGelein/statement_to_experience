import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Dummy data
  app.get('BoardService').update([
    ['e', 'b', 'e', 'b', 'e', 'b', 'e', 'b', 'e', 'b'],
    ['b', 'e', 'b', 'e', 'b', 'e', 'b', 'e', 'b', 'e'],
    ['e', 'b', 'e', 'b', 'e', 'b', 'e', 'b', 'e', 'b'],
    ['b', 'e', 'b', 'e', 'b', 'e', 'b', 'e', 'b', 'e'],
    ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
    ['e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e'],
    ['e', 'w', 'e', 'w', 'e', 'w', 'e', 'w', 'e', 'w'],
    ['w', 'e', 'w', 'e', 'w', 'e', 'w', 'e', 'w', 'e'],
    ['e', 'w', 'e', 'w', 'e', 'w', 'e', 'w', 'e', 'w'],
    ['w', 'e', 'w', 'e', 'w', 'e', 'w', 'e', 'w', 'e'],
  ])

  // app.get('BoardService').move('b', 3, 0, 4, 1)

  await app.listen(3000, () => {
    console.log(`Server listening on localhost:3000`)
    console.log(`Launched on ${new Date()}`)
  })
}

bootstrap()
