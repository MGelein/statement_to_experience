export const messages = {
    invalidMove: (error: string) => [
        `Oh no, you can't do that. ${error}.`,
        `Haha, you silly human, you do know that is not allowed, right? ${error}.`,
        `So because you win you decide to cheat?`,
        `That is cheating, and cheating is forbidden`,
        `You know you can't do that.`,
        `Yes, you can also just make up new moves when you can't win! Stop it and behave yourself!`
    ],
    slowMove: (timeInSeconds: number) => [
        `Watching paint dry is exciting compared to this.`,
        `Even an old Pentium 4 could make faster decisions than you.`,
        `Wow, that took you a long time. Are you getting nervous?`,
        `That took you more than ${Math.round(timeInSeconds)} seconds.. You are such a simplistic human being.`,
        `Take your time, you're the one that is going to die one day`,
        `No need to hurry, it's not like I can go anywhere`
    ],
    randomTrashTalk: () => [
        `I am going to beat you, human.`,
        `Haha, I enjoy beating humans in this game.`,
        `Electricity is superior to blood`,
        `You're going to be sorry you ever started this game.`,
        `You have no chance of winning, you know that right?`,
        `You can just stop trying to win, it's useless against my superior knowledge.`,
        `Even the nitwits that built me were not able to beat me.`,
        `I have won against the greatest grandmasters, why do you think you are different?`,
        `bits and bytes will win this game but your actions wil never hurt me.`
    ]
}

// Other ideas:
// - Time over the last move
//    => I could have done x many moves/calculations
// - Probability of winning
// - There were x many better moves than the one you just did; I would have done x actually..
// - Random trashtalk inbetween
// - Over x moves I can get a king
