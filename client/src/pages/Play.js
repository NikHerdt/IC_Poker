import React, { useContext, useEffect, useState } from 'react';
import Container from '../components/layout/Container';
import Button from '../components/buttons/Button';
import gameContext from '../context/game/gameContext';
import socketContext from '../context/websocket/socketContext';
import PokerTable from '../components/game/PokerTable';
import { RotateDevicePrompt } from '../components/game/RotateDevicePrompt';
import { PositionedUISlot } from '../components/game/PositionedUISlot';
import { PokerTableWrapper } from '../components/game/PokerTableWrapper';
import { Seat } from '../components/game/Seat';
import Text from '../components/typography/Text';
import modalContext from '../context/modal/modalContext';
import { withRouter } from 'react-router-dom';
import { TableInfoWrapper } from '../components/game/TableInfoWrapper';
import { InfoPill } from '../components/game/InfoPill';
import { GameUI } from '../components/game/GameUI';
import { GameStateInfo } from '../components/game/GameStateInfo';
import PokerCard from '../components/game/PokerCard';
import contentContext from '../context/content/contentContext';

const Play = ({ history, location }) => {
  const isQuickGame = new URLSearchParams(location.search).get('mode') === 'quick';
  const { socket } = useContext(socketContext);
  const { openModal } = useContext(modalContext);
  const {
    messages,
    currentTable,
    isPlayerSeated,
    seatId,
    joinTable,
    leaveTable,
    sitDown,
    standUp,
    fold,
    check,
    call,
    raise,
    startHand,
    pauseGame,
    resumeGame,
  } = useContext(gameContext);
  const { getLocalizedString } = useContext(contentContext);

  const [bet, setBet] = useState(0);

  useEffect(() => {
    !socket &&
      openModal(
        () => (
          <Text>{getLocalizedString('game_lost-connection-modal_text')}</Text>
        ),
        getLocalizedString('game_lost-connection-modal_header'),
        getLocalizedString('game_lost-connection-modal_btn-txt'),
        () => history.push('/'),
      );
    // Use table 2 for quick game, table 1 for regular tables
    const tableId = isQuickGame ? 2 : 1;
    socket && joinTable(tableId);
    return () => leaveTable();
    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    if (currentTable) {
      const minBet = currentTable.minBet || 0;
      const callAmount = currentTable.callAmount || 0;
      const minRaise = currentTable.minRaise || minBet * 2;
      
      if (callAmount > minBet) {
        setBet(callAmount);
      } else if (currentTable.pot > 0) {
        setBet(minRaise);
      } else {
        setBet(minBet);
      }
    }
  }, [currentTable]);

  return (
    <>
      <RotateDevicePrompt />
      <Container fullHeight>
        {currentTable && (
          <>
            <PositionedUISlot
              bottom="2vh"
              left="1.5rem"
              scale="0.65"
              style={{ zIndex: '50' }}
            >
              <Button small secondary onClick={leaveTable}>
                {getLocalizedString('game_leave-table-btn')}
              </Button>
            </PositionedUISlot>
            {/* Start button for first hand */}
            {currentTable && currentTable.waitingForStart && currentTable.isFirstHand && (
              <PositionedUISlot
                bottom="2vh"
                left="50%"
                scale="0.65"
                style={{ zIndex: '50', transform: 'translateX(-50%)' }}
                origin="bottom center"
              >
                <Button small primary onClick={() => startHand()}>
                  Start Game
                </Button>
              </PositionedUISlot>
            )}
            {/* Pause/Resume button - show when game is active */}
            {currentTable && !currentTable.handOver && (
              <PositionedUISlot
                top="2vh"
                left="1.5rem"
                scale="0.65"
                style={{ zIndex: '50' }}
                origin="top left"
              >
                {currentTable.isPaused ? (
                  <Button small primary onClick={() => resumeGame()}>
                    Resume
                  </Button>
                ) : (
                  <Button small secondary onClick={() => pauseGame()}>
                    Pause
                  </Button>
                )}
              </PositionedUISlot>
            )}
            {!isPlayerSeated && (
              <PositionedUISlot
                bottom="1.5vh"
                right="1.5rem"
                scale="0.65"
                style={{ pointerEvents: 'none', zIndex: '50' }}
                origin="bottom right"
              >
                <TableInfoWrapper>
                  <Text textAlign="right">
                    <strong>{currentTable.name}</strong> |{' '}
                    <strong>
                      {getLocalizedString('game_info_limit-lbl')}:{' '}
                    </strong>
                    ${new Intl.NumberFormat(
                      document.documentElement.lang,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    ).format(currentTable.limit)}{' '}
                    |{' '}
                    <strong>
                      {getLocalizedString('game_info_blinds-lbl')}:{' '}
                    </strong>
                    ${new Intl.NumberFormat(
                      document.documentElement.lang,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    ).format(currentTable.minBet)}{' '}
                    /{' '}
                    ${new Intl.NumberFormat(
                      document.documentElement.lang,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    ).format(currentTable.minBet * 2)}
                  </Text>
                </TableInfoWrapper>
              </PositionedUISlot>
            )}
          </>
        )}
        <PokerTableWrapper>
          <PokerTable />
          {currentTable && (
            <>
              {(() => {
                // Only show seats that are occupied or available for joining
                const seatsToShow = [];
                const maxPlayers = currentTable.maxPlayers || 12;
                
                // Always show occupied seats
                for (let i = 1; i <= maxPlayers; i++) {
                  if (currentTable.seats && currentTable.seats[i]) {
                    seatsToShow.push(i);
                  }
                }
                
                // If player isn't seated, show a few empty seats for joining
                // Show empty seats adjacent to occupied ones, or first few if table is empty
                if (!isPlayerSeated) {
                  const occupiedSeats = seatsToShow;
                  const emptySeats = [];
                  
                  for (let i = 1; i <= maxPlayers; i++) {
                    if (!currentTable.seats || !currentTable.seats[i]) {
                      emptySeats.push(i);
                    }
                  }
                  
                  if (occupiedSeats.length === 0) {
                    // Table is empty - show first 3 seats for joining
                    seatsToShow.push(...emptySeats.slice(0, 3));
                  } else {
                    // Show 2-3 empty seats near occupied ones
                    const nearbyEmpty = emptySeats.filter(seatNum => {
                      return occupiedSeats.some(occupied => {
                        const diff = Math.abs(seatNum - occupied);
                        const wrapDiff = Math.min(
                          Math.abs(seatNum - occupied - maxPlayers),
                          Math.abs(seatNum - occupied + maxPlayers)
                        );
                        return diff <= 2 || wrapDiff <= 2;
                      });
                    });
                    seatsToShow.push(...nearbyEmpty.slice(0, 3));
                  }
                }
                
                return seatsToShow.map((seatNumber) => {
                  const maxPlayers = currentTable.maxPlayers || 12;
                  // Calculate position for each seat in a circle
                  // Start from top (12 o'clock) and go clockwise
                  const angle = ((seatNumber - 1) * (360 / maxPlayers) - 90) * (Math.PI / 180);
                  const radius = 42; // Distance from center in percentage
                  
                  // Calculate position relative to center (50%, 50%)
                  const x = radius * Math.cos(angle);
                  const y = radius * Math.sin(angle);
                  
                  // Convert to top/left/right/bottom positioning
                  const leftPercent = 50 + x;
                  const topPercent = 50 + y;
                  
                  // Determine origin based on quadrant
                  let origin = 'center center';
                  if (y < -10) origin = 'top center';
                  else if (y > 10) origin = 'bottom center';
                  else if (x < -10) origin = 'center left';
                  else if (x > 10) origin = 'center right';
                  
                  return (
              <PositionedUISlot
                      key={seatNumber}
                      left={`${leftPercent}%`}
                      top={`${topPercent}%`}
                scale="0.55"
                      origin={origin}
                      style={{ transform: 'translate(-50%, -50%)' }}
              >
                <Seat
                        seatNumber={seatNumber}
                  currentTable={currentTable}
                  isPlayerSeated={isPlayerSeated}
                  sitDown={sitDown}
                        isQuickGame={isQuickGame}
                />
              </PositionedUISlot>
                  );
                });
              })()}
              <PositionedUISlot
                width="100%"
                origin="center center"
                scale="0.60"
                style={{
                  display: 'flex',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {currentTable.board && currentTable.board.length > 0 && (
                  <>
                    {currentTable.board.map((card, index) => (
                      <PokerCard key={index} card={card} />
                    ))}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot bottom="8%" scale="0.60" origin="bottom center">
                {messages && messages.length > 0 && (
                  <>
                    <InfoPill>{messages[messages.length - 1]}</InfoPill>
                    {!isPlayerSeated && (
                      <InfoPill>Sit down to join the game!</InfoPill>
                    )}
                    {currentTable.winMessages && currentTable.winMessages.length > 0 && (
                      <InfoPill>
                        {
                          currentTable.winMessages[
                            currentTable.winMessages.length - 1
                          ]
                        }
                      </InfoPill>
                    )}
                  </>
                )}
              </PositionedUISlot>
              <PositionedUISlot
                bottom="25%"
                scale="0.60"
                origin="center center"
              >
                {(!currentTable.winMessages || currentTable.winMessages.length === 0) && (
                  <GameStateInfo currentTable={currentTable} />
                )}
              </PositionedUISlot>
            </>
          )}
        </PokerTableWrapper>

        {currentTable &&
          isPlayerSeated &&
          currentTable.seats[seatId] &&
          currentTable.seats[seatId].turn && (
            <GameUI
              currentTable={currentTable}
              seatId={seatId}
              bet={bet}
              setBet={setBet}
              raise={raise}
              standUp={standUp}
              fold={fold}
              check={check}
              call={call}
            />
          )}
      </Container>
    </>
  );
};

export default withRouter(Play);
