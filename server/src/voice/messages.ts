export const messages = {
    invalidMove: (error: string) => [
        `Oh no, you can't do that. ${error}.`,
        `Haha, you silly human, you do know that is not allowed, right? ${error}.`
    ],
    slowMove: (timeInSeconds: number) => [
        `Wow, that took you a long time. Are you getting nervous?`,
        `That took you more than ${Math.round(timeInSeconds)} seconds.. You are such a simplistic human being.`
    ],
    randomTrashTalk: () => [
        `I am going to beat you, human.`,
        `Haha, I enjoy beating humans in this game.`
    ]
}

// Other ideas:
// - Time over the last move
//    => I could have done x many moves/calculations
// - Probability of winning
// - There were x many better moves than the one you just did; I would have done x actually..
// - Random trashtalk inbetween
// - Over x moves I can get a king
