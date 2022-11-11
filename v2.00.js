var config = {
    ScriptTitle: {
        type: 'noop',
        label: ' Crash.Bet Manual Enter v2'
    },
    baseBet: {
        value: 1000,
        type: 'balance',
        label: 'Begin bet'
    },
    warning1: {
        type: 'noop',
        label: 'Warning: Make sure to use the high bet limitation!'
    },
    stop: {
        value: 1e8,
        type: 'balance',
        label: 'stop if bet >'
    },
    basePayout: {
        value: 2.1,
        type: 'multiplier',
        label: 'Begin Payout'
    },
    lossSet: {
        type: 'checkbox',
        label: 'Lose Game Settings',
        value: true
    },
    lossSetInfo: {
        type: 'noop',
        label: 'use "/" as separator'
    },
    lossBets: {
        value: '15/20',
        type: 'text',
        label: 'Lose Bet Series'
    },
    lossPayouts: {
        value: '2.00/1.90',
        type: 'text',
        label: 'Lose Payout Series'
    },
    winSet: {
        type: 'checkbox',
        label: 'Win Game Settings',
        value: false
    },
    winSetInfo: {
        type: 'noop',
        label: 'use "/" as separator'
    },
    winBets: {
        value: '15/20',
        type: 'text',
        label: 'Win Bet Series'
    },
    winPayouts: {
        value: '2.00/1.90',
        type: 'text',
        label: 'Win Payout Series'
    },
    winBeginSettings: {
        value: 'onlyLost',
        type: 'radio',
        label: 'Won game list setting',
        options: {
            onlyLost: {
                type: "noop",
                label: "Play if there is a lost game before"
            },
            everytime: {
                type: 'noop',
                label: 'Everytime play the list'
            }
        }
    },
    winRepeat: {
        value: 0,
        type: 'multiplier',
        label: 'Win game list repetition amount'
    },
    startPointTitle: {
        type: 'noop',
        label: 'Starting point setting'
    },
    startPoint: {
        type: 'checkbox',
        label: 'Continue in the same order of the list',
        value: false
    },
    endSettings: {
        value: 'turnBack',
        type: 'radio',
        label: 'End of list settings',
        options: {
            turnBack: {
                type: "noop",
                label: "Back to top repeat"
            },
            contLast: {
                type: 'noop',
                label: 'Continue from last value'
            }
        }
    },
    warning2: {
        type: 'noop',
        label: 'Check the list before starting the game!'
    },
    checkList: {
        type: 'checkbox',
        label: 'Check List Mode (Print values ​​for check)',
        value: true
    }
};

log('Script is running..');

var currentBet = config.baseBet.value;
var currentPayout = config.basePayout.value
var lossBetSeriesRaW = config.lossBets.value
var lossBetSeries = lossBetSeriesRaW.split("/")
var lossPayoutSeriesRaw = config.lossPayouts.value
var lossPayoutSeries = lossPayoutSeriesRaw.split("/")
var winBetSeriesRaw = config.winBets.value
var winBetSeries = winBetSeriesRaw.split("/")
var winPayoutSeriesRaw = config.winPayouts.value
var winPayoutSeries = winPayoutSeriesRaw.split("/")
var gameCount = 0
var lossGameCount = 0
var winGameCount = 0
var shiftGameCount = 0
var repValidCount = 0
var lossStatus = false

if (config.checkList.value) {
    checkList()
} else {
    if (config.lossSet.value) {
        if (lossBetSeries.length != lossPayoutSeries.length) {
            stop('Bets and payouts do not matched, bets and payouts must be the same amount.')
        }
    }
    if (config.winSet.value) {
        if (winBetSeries.length != winPayoutSeries.length) {
            stop('Bets and payouts do not matched, bets and payouts must be the same amount.')
        }
    }

    engine.bet(roundBit(currentBet), currentPayout)
    log('Begining game Bet:', currentBet / 100, 'bits, Payout', currentPayout)

    engine.on('GAME_STARTING', onGameStarted)
    engine.on('GAME_ENDED', onGameEnded)
}

function onGameStarted() {
    engine.bet(roundBit(currentBet), roundPo(currentPayout));
    log('Bet was made, Bet: ', roundBit(currentBet) / 100, 'bits, Payout: ', roundPo(currentPayout))
}

function onGameEnded() {
    var lastGame = engine.history.first()

    if (!lastGame.wager) {
        return;
    }

    if (lastGame.cashedAt) {
        if (config.startPoint.value) {
            gameCount = shiftGameCount
        } else {
            gameCount = winGameCount
        }

        if (!config.winSet.value) {
            currentBet = config.baseBet.value;
            currentPayout = config.basePayout.value
        } else {
            if (config.winBeginSettings.value === 'onlyLost' && lossStatus) {
                if (gameCount >= winBetSeries.length) {
                    if (config.endSettings.value === 'contLast') {
                        currentBet = parseFloat(winBetSeries[winBetSeries.length - 1]) * 100
                        currentPayout = parseFloat(winPayoutSeries[winBetSeries.length - 1])
                    } else {
                        winGameCount = 0
                        shiftGameCount = 0
                        if (config.startPoint.value) {
                            gameCount = shiftGameCount
                        } else {
                            gameCount = winGameCount
                        }
                        currentBet = parseFloat(winBetSeries[gameCount]) * 100
                        currentPayout = parseFloat(winPayoutSeries[gameCount])
                    }
                } else {
                    currentBet = parseFloat(winBetSeries[gameCount]) * 100
                    currentPayout = parseFloat(winPayoutSeries[gameCount])
                }
            } else {
                if (config.winBeginSettings.value === 'everytime') {
                    if (gameCount >= winBetSeries.length) {
                        if (config.endSettings.value === 'contLast') {
                            currentBet = parseFloat(winBetSeries[winBetSeries.length - 1]) * 100
                            currentPayout = parseFloat(winPayoutSeries[winBetSeries.length - 1])
                        } else {
                            winGameCount = 0
                            shiftGameCount = 0
                            if (config.startPoint.value) {
                                gameCount = shiftGameCount
                            } else {
                                gameCount = winGameCount
                            }
                            currentBet = parseFloat(winBetSeries[gameCount]) * 100
                            currentPayout = parseFloat(winPayoutSeries[gameCount])
                        }
                    } else {
                        currentBet = parseFloat(winBetSeries[gameCount]) * 100
                        currentPayout = parseFloat(winPayoutSeries[gameCount])
                    }
                } else {
                    currentBet = config.baseBet.value
                    currentPayout = config.basePayout.value
                }

            }

        }
        log('You Win, Next game Bet: ', roundBit(currentBet) / 100, 'bits, Payout: ', roundPo(currentPayout))
        shiftGameCount++
        winGameCount++
        repValidCount++
        lossGameCount = 0

        if (repValidCount >= config.winRepeat.value) {
            lossStatus = false
        }


    } else {
        if (config.startPoint.value) {
            gameCount = shiftGameCount
        } else {
            gameCount = lossGameCount
        }

        if (!config.lossSet.value) {
            currentBet = config.baseBet.value;
            currentPayout = config.basePayout.value
        } else {
            if (gameCount >= lossBetSeries.length) {
                if (config.endSettings.value === 'contLast') {
                    currentBet = parseFloat(lossBetSeries[lossBetSeries.length - 1]) * 100
                    currentPayout = parseFloat(lossPayoutSeries[lossBetSeries.length - 1])
                } else {
                    lossGameCount = 0
                    shiftGameCount = 0
                    if (config.startPoint.value) {
                        gameCount = shiftGameCount
                    } else {
                        gameCount = lossGameCount
                    }
                    currentBet = parseFloat(lossBetSeries[gameCount]) * 100
                    currentPayout = parseFloat(lossPayoutSeries[gameCount])
                }
            } else {
                currentBet = parseFloat(lossBetSeries[gameCount]) * 100
                currentPayout = parseFloat(lossPayoutSeries[gameCount])
            }

        }
        log('You Loss, Next game Bet: ', roundBit(currentBet) / 100, 'bits, Payout: ', roundPo(currentPayout))
        shiftGameCount++
        lossGameCount++
        winGameCount = 0
        repValidCount = 0
        lossStatus = true

    }
    if (currentBet > config.stop.value) {

        engine.removeListener('GAME_STARTING', onGameStarted)
        engine.removeListener('GAME_ENDED', onGameEnded)
        stop(currentBet, 'Maximum amount reached, Script stopped.')
    }
}

function roundBit(bet) {
    return Math.round(bet / 100) * 100;
}

function roundPo(payout) {
    return Math.round(payout * 100) / 100;
}

function checkList() {
    var i
    log('----------CHECK LIST----------')
    log('First Game, Base Bet: ', roundBit(currentBet) / 100, ' Base Payout: ', currentPayout)
    if (config.lossSet.value) {
        log('Loss game list mode on')
        if (lossBetSeries.length === lossPayoutSeries.length) {
            log('Bets and payouts matched')
            for (i = 0; i < lossBetSeries.length; i++) {
                log('Game', i + 1, ' Bet: ', lossBetSeries[i], ' Payout: ', lossPayoutSeries[i])
            }
        } else {
            log('Bets and payouts do not matched, bets and payouts must be the same amount.')
        }
    } else {
        log('Loss game list mode off')
    }

    if (config.winSet.value) {
        log('Win game list mode on')
        if (winBetSeries.length === winPayoutSeries.length) {
            log('Bets and payouts matched')
            for (i = 0; i < winBetSeries.length; i++) {
                log('Game', i + 1, ' Bet: ', winBetSeries[i], ' Payout: ', winPayoutSeries[i])
            }
        } else {
            log('Bets and payouts do not matched other, bets and payouts must be the same amount.')
        }

    } else {
        log('Win game list mode off')
    }
    log('Begin of list mode: ', config.winBeginSettings.value === 'onlyLost' ? 'Play if there is a lost game before' : 'Everytime play the list')
    log('End of list mode: ', config.endSettings.value === 'turnBack' ? 'Back to top repeat' : 'Continue from last value')
    log('Continue of list mode: ', config.startPoint.value ? 'Continue from the game in the same order of the list' : 'Play from the top of the list')
    log('If there is a lost game in the game before the winning match,  plays ', config.winRepeat.value, ' games from the win game list.')
    log('(Available only when "Play if game lost before starting mode is set" option is selected.)')
    log(' ')
    stop('End of check list')

}
