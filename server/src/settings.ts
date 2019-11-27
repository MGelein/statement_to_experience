export const settings = {
    ai: {
        strength: 1.0,
        minimaxDepth: 4,
        alphaBetaPruning: true,
        minEvaluationTimeInSeconds: 1.5
    },
    voice: {
        enabled: false,
        minTimeBetweenMessagesInSeconds: 10,
        intervalInSeconds: 15,
        idleTalkEnabled: true,
        slowMoveTimeInSeconds: 15
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
        initialBoard10: [
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
        ],
        // initialBoard8: [
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', 'B', ' ', 'B'],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     ['W', ' ', 'W', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        // ],
        initialBoard8: [
            [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
            ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
            [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
            [' ', 'w', ' ', 'w', ' ', 'w', ' ', 'w'],
            ['w', ' ', 'w', ' ', 'w', ' ', 'w', ' '],
        ],
        // initialBoard8: [
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', 'b', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', 'w', ' ', ' ', ' ', ' ', ' '],
        //     [' ', 'w', ' ', 'w', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        //     [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        // ]
    },
    robot: {
        goHomeAfterEveryMove: true,
        timeoutAfterEveryCommandMs: 200
    }
}