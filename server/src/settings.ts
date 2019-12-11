export const settings = {
    ai: {
        strength: 1.0,
        minimaxDepth: 4,
        alphaBetaPruning: true,
        minEvaluationTimeInSeconds: 1.5
    },
    voice: {
        enabled: true,
        minTimeBetweenMessagesInSeconds: 10,
        intervalInSeconds: 15,
        idleTalkEnabled: true,
        slowMoveTimeInSeconds: 20
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
        baseLValue: 1840,
        positionLValueOffsets: [
            [0, 100, 0, 120, 0, 140, 0, 160],
            [100, 0, 120, 0, 140, 0, 160, 0],
            [0, 80, 0, 60, 0, 120, 0, 140],
            [80, 0, 100, 0, 120, 0, 140, 0],
            [0, 60, 0, 80, 0, 100, 0, 120],
            [40, 0, 60, 0, 100, 0, 140, 0],
            [0, 40, 0, 80, 0, 140, 0, 140],
            [0, 0, 60, 0, 100, 0, 160, 0]
        ],
        presetKingCount: 4
    },
    robot: {
        goHomeAfterEveryMove: true,
        timeoutAfterEveryCommandMs: 200
    }
}