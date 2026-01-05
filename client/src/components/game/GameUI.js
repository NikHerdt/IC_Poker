import React, { useContext } from 'react';
import contentContext from '../../context/content/contentContext';
import Button from '../buttons/Button';
import { BetSlider } from './BetSlider';
import { UIWrapper } from './UIWrapper';

export const GameUI = ({
  currentTable,
  seatId,
  bet,
  setBet,
  raise,
  standUp,
  fold,
  check,
  call,
}) => {
  const { getLocalizedString } = useContext(contentContext);

  return (
    <UIWrapper>
      <BetSlider
        currentTable={currentTable}
        seatId={seatId}
        bet={bet}
        setBet={setBet}
      />
      <Button 
        small 
        onClick={() => {
          const seat = currentTable.seats[seatId];
          if (seat) {
            raise(bet + (seat.bet || 0));
          }
        }}
        disabled={!currentTable.seats[seatId]}
      >
        {getLocalizedString('game_ui_bet')} ${bet.toFixed(2)}
      </Button>
      <Button small secondary onClick={standUp}>
        {getLocalizedString('game_ui_stand-up')}
      </Button>
      <Button small secondary onClick={fold}>
        {getLocalizedString('game_ui_fold')}
      </Button>
      <Button
        small
        secondary
        disabled={
          !currentTable.seats[seatId] ||
          (currentTable.callAmount !== currentTable.seats[seatId].bet &&
          currentTable.callAmount > 0)
        }
        onClick={check}
      >
        {getLocalizedString('game_ui_check')}
      </Button>
      <Button
        small
        disabled={
          !currentTable.callAmount ||
          currentTable.callAmount === 0 ||
          (currentTable.seats[seatId] && currentTable.seats[seatId].bet >= currentTable.callAmount)
        }
        onClick={call}
      >
        {getLocalizedString('game_ui_call')}{' '}
        {currentTable.callAmount &&
        currentTable.seats[seatId] &&
        currentTable.seats[seatId].bet < currentTable.callAmount &&
        currentTable.callAmount <= currentTable.seats[seatId].stack
          ? `$${(currentTable.callAmount - currentTable.seats[seatId].bet).toFixed(2)}`
          : ''}
      </Button>
      <Button
        small
        onClick={() => {
          const seat = currentTable.seats[seatId];
          if (seat) {
            raise((seat.stack || 0) + (seat.bet || 0));
          }
        }}
        disabled={!currentTable.seats[seatId]}
      >
        {getLocalizedString('game_ui_all-in')} (
        ${currentTable.seats[seatId] ? currentTable.seats[seatId].stack.toFixed(2) : '0.00'})
      </Button>
    </UIWrapper>
  );
};
