import { Controller, Get, Header, Post, Body } from '@nestjs/common'

import { StorageService } from '../storage.service'
import { Move, Board, BoardService, Player, Piece, Turn } from './board.service'

import { settings } from '../settings'
import { MoveValidationService } from '../game/move-validation.service'
import { AIService } from '../ai/ai.service'
import { RobotCommandsService } from '../robot/robot-commands.service'
import { VoiceService } from '../voice/voice.service'
import { MoveGenerationService } from '../game/move-generation.service'
import { GameStateService } from '../game/game-state.service'
import { TurnToMoveService } from '../game/turn-to-move.service'
import { MonitoringService } from '../misc/monitoring.service'

const arraysEqual = (a1: any[], a2: any[]): boolean => {
  return JSON.stringify(a1) == JSON.stringify(a2)
}

const countDifferentPieces = (a1: any[], a2: any[]): number => {
  let count = 0
  for (let row = 0; row < Math.min(a1.length, a2.length); row++) {
    for (let col = 0; col < Math.min(a1[row].length, a2[row].length); col++) {
      if (a1[row][col] !== a2[row][col]) {
        count += 1
      }
    }
  }

  return count
}

const printProgress = (progress: number, prefix: string = '') =>{
  (process.stdout as any).clearLine();
  (process.stdout as any).cursorTo(0);
  (process.stdout as any).write(prefix + progress + '%');
}

@Controller('board-state')
export class BoardStateController {

  constructor(
    private readonly boardService: BoardService,
    private readonly robotCommandsService: RobotCommandsService,
    private readonly storage: StorageService,
    private readonly voiceService: VoiceService,
    private readonly gameStateService: GameStateService,
    private readonly turnToMoveService: TurnToMoveService,
    private readonly moveGenerationService: MoveGenerationService,
    private readonly moveValidationService: MoveValidationService,
    private readonly aiService: AIService,
    private readonly monitoringService: MonitoringService) {
      setInterval(() => {
        if ((Date.now() - this.lastCameraViewAt) > 3000) {
          this.monitoringService.setStatus('camera', false)
        } else {
          this.monitoringService.setStatus('camera', true)
        }
      }, 1000)
    }

  isFirst: boolean = true

  lastCameraView: string[][] = []
  lastCameraViewAt: number = 0

  previousBoard: Piece[][] | null = null
  sameBoardInARowCount: number = 0

  sameBoardThreshold: number = 6

  lastAIMoveAt: number = 0

  waitingForFirstMove: boolean = false
  overwritingBoardState: boolean = false

  boardSetupProgress: number = 0
  lastTriggeredSetupProgressAt: number = 0

  waitingToResetBlackPieceMove: boolean = false
  waitingToResetInvalidMove: boolean = false
  waitingToResetNonJump: boolean = false

  @Post()
  async update(@Body() state: any): Promise<string> {
    const player: Player = 'w'
    const oldBoard = this.boardService.get()
    const newBoard = Object.keys(state).reduce((newState: string[], key: string) => [...newState, state[key]], [])

    this.lastCameraView = newBoard
    this.lastCameraViewAt = Date.now()

    if (this.robotCommandsService.isMoving) {
      return 'Robot arm is moving'
    }

    if (!this.waitingForFirstMove && !this.gameStateService.state.startedAt && !this.overwritingBoardState) {
      const diff = countDifferentPieces(newBoard, settings.board.initialBoard)

      if (diff > 0) {
        const progress = Math.round(((24 - diff)/24) * 100)
        if (progress > this.boardSetupProgress) {
          this.boardSetupProgress = progress
          printProgress(progress, 'Waiting for board set up, currently at ')

          if (progress >= this.lastTriggeredSetupProgressAt + 10) {
            this.voiceService.triggerBoardSetupProgress(progress)
            this.lastTriggeredSetupProgressAt = progress
          }
        }

        return 'Waiting for the board to be set up correctly'
      } else {
        this.boardSetupProgress = 0
        this.lastTriggeredSetupProgressAt = 0
        this.waitingForFirstMove = true

        this.boardService.update(newBoard)
        this.voiceService.triggerGameSetupReady()

        console.log('Board configured correctly, waiting for the first move')
      
        return 'Board configured correctly, waiting for the first move'
      }
    }

    // If there is a change to the currently stored board state
    if (!arraysEqual(oldBoard, newBoard)) {
      const oldBlackPiecesCount = this.boardService.getPieceCount(oldBoard, 'b', true)
      const oldWhitePiecesCount = this.boardService.getPieceCount(oldBoard, 'w', true)
      const newBlackPiecesCount = this.boardService.getPieceCount(newBoard, 'b', true)
      const newWhitePiecesCount = this.boardService.getPieceCount(newBoard, 'w', true)

      if (arraysEqual(newBoard, this.previousBoard) && this.sameBoardInARowCount < (this.sameBoardThreshold - 1)) {
        // If this board state has been seen before, but the threshold hasnt been reached yet
        this.previousBoard = newBoard
        this.sameBoardInARowCount += 1
              
        return String(this.sameBoardInARowCount - 1)
      } else if (!this.overwritingBoardState && (newBlackPiecesCount > oldBlackPiecesCount || newWhitePiecesCount > oldWhitePiecesCount)) {
        // Definitely an unreasonable detection, so should simply be ignored
        return String(this.sameBoardInARowCount - 1)
      } else if (!arraysEqual(newBoard, this.previousBoard)) {
        // If this board state has not been seen before
        this.previousBoard = newBoard
        this.sameBoardInARowCount = 0

        return '1'
      }

      if (this.overwritingBoardState) {
        this.boardService.update(newBoard)
        this.overwritingBoardState = false

        this.gameStateService.overwrite()

        console.log('Playing AI move after overwrite')
      
        await this.aiService.play()
        this.lastAIMoveAt = new Date().getTime()
        
        return 'OK'
      }

      // Detect the move
      let fromRow = -1
      let fromCol = -1
      let toRow = -1
      let toCol = -1
      for (let row = 0; row < settings.board.rowCount; row++) {
        for (let col = 0; col < settings.board.colCount; col++) {
          if (oldBoard[row][col].toLowerCase() === player) {
            if (newBoard[row][col] === ' ') {
              fromRow = row
              fromCol = col
            }
          } else if (oldBoard[row][col] === ' ') {
            if (newBoard[row][col].toLowerCase() === player) {
              toRow = row
              toCol = col
            }
          }
        }
      }

      if (fromRow !== -1 && fromCol !== -1 && toRow !== -1 && toCol !== -1) {
        const move: Move = {
          fromRow: Number(fromRow),
          fromCol: Number(fromCol),
          toRow: Number(toRow),
          toCol: Number(toCol)
        }

        const turn: Turn | string = this.turnToMoveService.getTurnFromMove(oldBoard, move)

        if (typeof turn !== 'string' && turn.length > 0) {
          // Check if a black piece was move incorrectly
          const wouldBeBoard = this.boardService.applyTurn(oldBoard, turn)

          for (let row = 0; row < settings.board.rowCount; row++) {
            for (let col = 0; col < settings.board.colCount; col++) {
              if (wouldBeBoard[row][col].toLowerCase() === 'b') {
                if (newBoard[row][col].toLowerCase() !== 'b') {
                  if (!this.waitingToResetBlackPieceMove) this.voiceService.triggerBlackPieceHasMoved()
                  this.waitingToResetBlackPieceMove = true
                  return 'Has moved a black piece'
                }
              }
            }
          }

          this.waitingToResetBlackPieceMove = false
          this.waitingToResetInvalidMove = false
          
          this.move(oldBoard, turn)
        } else if (typeof turn === 'string') {
          console.log(`Move (${move.fromRow}, ${move.fromCol} to (${move.toRow}, ${move.toCol})) is invalid, because: ${turn}`)

          if (!this.waitingToResetInvalidMove) this.voiceService.triggerInvalidMove(turn)
          this.waitingToResetInvalidMove = true
        } else {
          console.error('Oh no')
        }
      } else {
        // Check if a black piece was move incorrectly
        for (let row = 0; row < settings.board.rowCount; row++) {
          for (let col = 0; col < settings.board.colCount; col++) {
            if (oldBoard[row][col].toLowerCase() === 'b') {
              if (newBoard[row][col].toLowerCase() !== 'b') {
                if (!this.waitingToResetBlackPieceMove) this.voiceService.triggerBlackPieceHasMoved()
                this.waitingToResetBlackPieceMove = true
                return 'Has moved a black piece'
              }
            }
          }
        }

        this.waitingToResetBlackPieceMove = false
      }

      return String(this.sameBoardInARowCount)
    }

    return 'OK'
  }

  private async move(oldBoard: Board, turn: Turn) {
    const lastMoveWasAJump = Math.abs(turn[0].toRow - turn[0].fromRow) > 1

    // Check if it was a move, but if there were jumps possible, then block the move
    if (!lastMoveWasAJump) {
      const player = oldBoard[Number(turn[0].fromRow)][Number(turn[0].fromCol)].toLowerCase() as Player
      const jumpsFromPreviousPosition = this.moveGenerationService.getAllPossibleJumps(oldBoard, player)

      if (jumpsFromPreviousPosition.length !== 0) {
        if (!this.waitingToResetNonJump) this.voiceService.triggerForceJump()
        this.waitingToResetNonJump = true
        return
      }
    }

    this.waitingToResetNonJump = false

    console.log(JSON.stringify(turn))

    const updatedBoard = this.boardService.applyTurn(this.boardService.get(), turn)
    this.boardService.update(updatedBoard)
    
    const player = oldBoard[Number(turn[0].fromRow)][Number(turn[0].fromCol)] as Player
    this.gameStateService.addTurn(player, turn)

    const moveDuration = ((new Date().getTime()) - this.lastAIMoveAt) / 1000
    if (this.lastAIMoveAt !== 0 && moveDuration > settings.voice.slowMoveTimeInSeconds) {
      this.voiceService.triggerSlowMove(moveDuration)
    }

    this.waitingForFirstMove = false
      
    await this.aiService.play()
    this.lastAIMoveAt = new Date().getTime()
  }

  @Get('overwrite')
  overwrite(): string {
    console.log('Overwriting board state...')
    
    this.sameBoardInARowCount = 0
    this.overwritingBoardState = true
    this.previousBoard = null

    return 'OK'
  }

  @Get('camera-view/csv')
  @Header('Content-Type', 'text/plain')
  csv(): string {
    return this.lastCameraView.map((row: Piece[]) => Object.keys(row).map((key: string) => row[key]).join('')).join('\n')
  }

  @Get('square-positions')
  getSquarePositions(): any {
    return this.storage.get('board/square-positions')
  }

  @Post('square-positions')
  saveSquarePositions(@Body() positions: any): string {
    this.storage.set('board/square-positions', positions)

    return 'OK'
  }

}
