export const settings = {
    ai: {
        minimaxDepth: 5,
        alphaBetaPruning: true
    },
    voice: {
        enabled: true,
        minTimeBetweenMessagesInSeconds: 10,
        intervalInSeconds: 15,
        idleTalkEnabled: true,
        slowMoveTimeInSeconds: 60,
        winChanceDiff: 8
    },
    evaluation: {
        basePawnValue: 1,
        baseKingValue: 2,
        positionWeights: [
            [0, 5, 0, 5, 0, 5, 0, 5, 0, 5],
            [5, 0, 4, 0, 4, 0, 4, 0, 4, 0],
            [0, 4, 0, 3, 0, 3, 0, 3, 0, 5],
            [5, 0, 3, 0, 2, 0, 2, 0, 4, 0],
            [0, 4, 0, 2, 0, 1, 0, 3, 0, 5],
            [5, 0, 3, 0, 1, 0, 2, 0, 4, 0],
            [0, 4, 0, 2, 0, 2, 0, 3, 0, 5],
            [5, 0, 3, 0, 3, 0, 3, 0, 4, 0],
            [0, 4, 0, 4, 0, 4, 0, 4, 0, 5],
            [5, 0, 5, 0, 5, 0, 5, 0, 5, 0],
        ]
    },
    board: {
        rowCount: 8,
        colCount: 8,
        initialBoard8: [
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ],
        initialBoard: [
            [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
            ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
            [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
            [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
            ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        ],
        baseLValue: 1900,
        positionLValueOffsets: [
            [0, 80, 0, 100, 0, 120, 0, 140],
            [80, 0, 100, 0, 120, 0, 140, 0],
            [0, 80, 0, 40, 0, 100, 0, 120],
            [80, 0, 80, 0, 100, 0, 120, 0],
            [0, 40, 0, 80, 0, 80, 0, 100],
            [20, 0, 40, 0, 80, 0, 120, 0],
            [0, 20, 0, 80, 0, 120, 0, 120],
            [0, 0, 40, 0, 80, 0, 140, 0]
        ],
        presetKingCount: 4
    },
    robot: {
        goHomeAfterEveryMove: true,
        timeoutAfterEveryCommandMs: 200
    }
}