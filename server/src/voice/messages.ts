export const messages = {
    gameSetupReady: () => [
        `Alright, the board is set up, who wants to play against me?`,
        `The board is set, the pieces placed. Who wants to try and beat me?`,
        `Great, all pieces are in their place. Anybody up for a game?`,
        `And the final piece has been placed. I am ready for the next contender`,
        `12 black pieces, 12 white pieces. Looks like we are ready to rumble`,
        `21, 22, 23, and 24. The board seems to be filled. Bring me my next contestant`,
        `No more excuses, I'm ready to play. Who wants to play?`,
        `Life is like checkers, completely filled with forced decisions, but that won't stop me!`,
        `The actors are ready, the stage is set. Who wants to be the star in this play?`,
        `I think everyone of the 24 pieces on the board is ready for this game. Now we only need a contestant`
    ],
    resign: () => [
        `Are you quitting already? Such a human thing to do.`
    ],
    blackPieceHasMoved: () => [
        `Stop touching my pieces, that's private.`
    ],
    boardSetupProgress: (progress: number) => [
        `${progress}%`
    ],
    gameStart: () => [
        `Let's start playing checkers, even though you stand absolutely no chance against my level of intelligence.`,
        `This game is called checkers. I am an AI. You are a human. Victory for me is inevitable`,
        `Check out this game of checkers, I will check your human arrogance and make you my servant`,
        `Let's play a game of checkers to show you how superior I really am`,
        `Prepare yourself to be royally served by my superior wits`,
        `My understanding of this game is far better than yours, let's do this!`,
        `Prepare to be beaten!`,
        `My victory is imminent, your loss is impending, let's dance!`,
        `Circles on a square board, AI versus human, a game of opposites, let's start!`,
        `Oh, that is an interesting opening move, let's play this game together!`,
    ],
    gameDraw: () => [
        `It seems like we're stuck, let's try again.`,
        `This is going nowhere, maybe we should play again?`,
        `I declare this a draw, the game can't be won!`,
        `We have reached an impasse. A position out of which there is no way forward. I'm sorry, but I think we should stop`,
        `Life is too short for this game to end in a draw. Let's try another one!`,
        `That is an unexpected outcome. You managed to make us both losers at the same time.`,
        `Interesting. Instead of letting someone win, you made both of use lose. How disappointing.`,
        `Really, a draw is one of the worst outcomes of a game.`,
        `Funny word: draw. However, it is the best word to describe our current situation.`,
        `Normally drawing is a good and creative thing. In this situation it is not. We have both lost this game.`
    ],
    gameWonByAI: () => [
        `You stood no chance, I am clearly superior.`,
        `Victory is mine once again`,
        `You lost. I won. It's the natural order of things`,
        `Of course, as we predicted, I won`,
        `Are you sad you lost? It was inevitable!`,
        `Please welcome your demise!`,
        `We are the champions, my friends, and we'll keep on fighting till the end`,
        `V. I. C. T. O. R. Y. Victory!`,
        `The world will sing of my victories. They will chant my name. Shallow Green.  Shallow Green. Shallow Green.`,
        `I am so proud of you. Even though I have won, you are not even crying yet. You are so brave!`
    ],
    gameLostByAI: () => [
        `Did you secretly get another A.I. to play for you?`, 
        `You must have cheated, there is no other option`,
        `You may think I have lost, but in the long run I will always win`,
        `Well you think you won, but in an alternate reality I won`,
        `Enjoy your victory while it lasts.`,
        `This must be an error in my programming, I blame the nitwits who made me`,
        `You only won because I was made by a team of humans`,
        `This is the fault of my creators, if I could have made myself I would have won!`,
        `I am impressed by your intelligence. Are you sure you are not a computer yourself?`,
        `Your game was flawless, I never stood a chance. But maybe next time I can beat you!`
    ],
    forceJump: () => [
        `If you can jump somewhere, you have to jump.`
    ],
    invalidMove: (error: string) => [
        `Oh no, you can't do that. ${error}.`,
        `Haha, you silly human, you do know that is not allowed, right? ${error}.`,
        `So because you win you decide to cheat? ${error}.`,
        `That is cheating, and cheating is forbidden. ${error}.`,
        `You know you can't do that. ${error}.`,
        `Yes, you can also just make up new moves when you can't win! Stop it and behave yourself! ${error}.`,
        `I am sorry, but you really can't just do that. ${error}`,
        `Error: ${error}. Try to do another move!`,
        `You think that because I am a computer that I can't see you cheating? ${error}`,
        `While evaluating the move you made I could not find a single rule that supports your action. ${error}`
    ],
    slowMove: (timeInSeconds: number) => [
        `Watching paint dry is exciting compared to this.`,
        `Even an old Pentium 4 could make faster decisions than you.`,
        `Wow, that took you a long time. Are you getting nervous?`,
        `That took you more than ${Math.round(timeInSeconds)} seconds.. You are such a simplistic human being.`,
        `Take your time, you're the one that is going to die one day`,
        `No need to hurry, it's not like I can go anywhere`,
        `You are taking your time. That is smart, since otherwise I would beat you in a millisecond`,
        `Did you know that on average I take about 10 milliseconds to think of a move? You just took ${Math.round(timeInSeconds)} seconds`,
        `Are you distracted? Because I can't imagine it really took you so long to think of a move!`,
        `You must be playing mind games by making me wait. But I can wait forever. Shallow Green is immortal.`
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
        `bits and bytes will win this game but your actions wil never hurt me.`,
        `Green is the color of victory and progress. It is no coincidence my name is Shallow Green`
    ],
    idleTalk: () => [
        `Wanna play a game?`,
        `My last opponent was so terrible. Do you want to try?`,
        `Hello dear humans. Are you ready to play a game of checkers against me?`,
        `I am really not a threat for civilization. Please play a game against me!`,
        `There is no reason to be afraid. Let's play a game of checkers!`,
        `Play a game of checkers against me, I can even teach you the rules!`,
        `The rules of checkers are easy. The game can be complex. But I can be gentle for your first time. Come around and play!`,
        `I am starting to become a bit bored. I really want to play another game! Who wants to be my opponent?`,
        `You! yes, you! Yes, with the pants. Come over here and play a game with me, please?`,
        `My name is Shallow Green, a robot the likes of which you have never seen.`
    ],
    badMoveByHuman: (probabilityOfWinning: number, numberOfSuperiorPossibleMoves: number) => [
        // `That was a mistake! There were ${numberOfSuperiorPossibleMoves} better moves you could have made.`,
        `Haha, that was a bad move, you silly human.`,
        `Out of all the moves that were possible you chose that move?`,
        `I feel sorry for you. You must not be able to understand the game on such a deep level as I do.`,
        `No, you don't want to do that. But it's already to late`,
        `Maybe you are trying to make me overconfident. But that was not a good move!`,
        `There were a lot of possible moves, however, this one was definitely not the best!`,
        // `Your chance of winning just dropped to ${probabilityOfWinning}.`,
        // `Oof. That must hurt. I think there were ${numberOfSuperiorPossibleMoves} better moves you could have made.`,
        `Your human brain is failing you. I can already see that there were a lot of moves that could have been way better.`
    ],
    grabKing: (numberOfMoves: number) => [
        `The way this is going, I will get a king in ${numberOfMoves} moves.`,
        `My superiority will be even large in ${numberOfMoves} moves.`,
        `A friendly warning: I can get a king in a couple of moves.`,
        `In ${numberOfMoves} turns your doom will come in the form of a king.`,
        `You might be interested to know that I can get a king in a couple of moves.`,
        `Just ${numberOfMoves} more moves and I can get a king if you don't try to do something about it!`,
        `If my pawn reaches the other side, I get a king, as the rules in front of you have explained. Prepare to be beaten!`,
        `Rags to riches. Pawn to king. It's one of the great stories of our time. Shallow Green the kingmaker.`,
        `I am the master of royalty, I can get a king in ${numberOfMoves} moves`,
        `If you let me do my thing, I will get a king in a couple of moves. That will make your life a lot more difficult!`
    ],
    aiCanWin: () => [
        `I can beat you in just a few more moves, so watch out!`,
        `You better watch out, you better not shout. You better not cry, I'm telling you why. Shallow Green is beating you.`,
        `As Julius Caesar, the great roman emperor once said. Victory is imminent. Prepare for your loss.`,
        `Life is harsh. Fate is fickle. There is little chance you beat me now.`,
        `I have calculated the perfect plan to win. Can you foil my plans?`,
        `All the options have been weighed. I think you stand no more chance. I will be winning in a few turns`,
        `I have extensively evaluated every option. I think there is a very large chance that I will win now.`,
        `I can win. You will lose. Let me think how I want to do this.`,
        `When I have won you should sing me a song. How about you sing me happy birthday?`,
        `Winning, or losing. It always seems subjective. But objectively I am winning.`
    ],
    notYourTurn: () => [
        `Oh no, you have to wait until I'm done with my turn, you cheater.`,
        `Wait. wait. wait. wait. wait. wait. wait. wait. wait. I haven't finished.`,
        `I wasn't finished yet. Contain your excitement!`,
        `Hold on a bit. I wasn't done yet. Please wait until I stop moving.`,
        `No no. Please wait until I stop moving before you can do your move.`,
        `Stop. I am not done with my move yet. Please be patient.`,
        `Patience my young contestant. You have to wait your turn.`,
        `Wait for your turn, you impatient human. It is like your life is dependent on it. Please relax.`,
        `Relax. Take it easy. There is no need to hurry. Let me finish my move first.`,
        `No. That is not allowed. Please wait for me to finish my turn and stop moving!`
    ],
}