export const messages = {
    gameStart: () => [
        `Let's start playing checkers, even though you stand absolutely no chance against my level of intelligence.`,
        `This game is called checkers. I am an AI. You are a human. Victory for me is inevitable`,
        `Check out this game of checkers, I will check your human arrogance and make you my servant`,
        `Let's play a game of checkers to show you how superior I really am`,
        `Prepare yourself to be royally served by my superior wits`,
        `My understanding of this game is far better than yours, let's do this!`,
        `Prepare to be beaten!`,
        `My victory is imminent, your loss is impending, let's dance!`,
        `Circles on a square board, AI versus human, a game of opposites, let's start!`
    ],
    gameWonByAI: () => [
        `You stood no chance, I am clearly superior.`,
        `Victory is mine once again`,
        `You lost. I won. It's the natural order of things`,
        `Of course, as we predicted, I won`,
        `Are you sad you lost? It was inevitable!`,
        `Please welcome your demise!`,
        `We are the champions, my friends, and we'll keep on fighting till the end`,
        `V. I. C. T. O. R. Y. Victory!`
    ],
    gameLostByAI: () => [
        `Did you secretly get another AI to play for you?`, 
        `You must have cheated, there is no other option`,
        `You may think I have lost, but in the long run I will always win`,
        `Well you think you won, but in an alternate reality I won`,
        `Enjoy your victory while it lasts.`,
        `This must be an error in my programming, I blame the nitwits who made me`,
        `You only won because I was made by a team of humans`,
        `This is the fault of my creators, if I could have made myself I would have won!`
    ],
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
    ],
    idleTalk: () => [
        `Wanna play a game?`,
        `My last opponent was so terrible. Do you want to try?`
    ],
    badMoveByHuman: (probabilityOfWinning: number, numberOfSuperiorPossibleMoves: number) => [
        `That was a mistake! There were ${numberOfSuperiorPossibleMoves} better moves you could have made.`,
        `Haha, that was a bad move, you silly human.`,
        `Out of all the moves that were possible you chose that move?`,
        `I feel sorry for you`,
        `No, you don't want to do that. But it's already to late`,
    ],
    grabKing: (numberOfMoves: number) => [
        `The way this is going, I will get a king in ${numberOfMoves} moves.`,
        `My superiority will be even large in ${numberOfMoves} moves.`,
        `A friendly warning: I can get a king in a couple of moves.`,
        `In ${numberOfMoves} turns your doom will come in the form of a king.`
    ],
}

// Other ideas:
// - Time over the last move
//    => I could have done x many moves/calculations
// - Probability of winning
// - There were x many better moves than the one you just did; I would have done x actually..
// - Random trashtalk inbetween
// - Over x moves I can get a king
