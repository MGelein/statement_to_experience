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
        ]
    },
    robot: {
        goHomeAfterEveryMove: false,
        timeoutAfterEveryCommandMs: 200
    }
}