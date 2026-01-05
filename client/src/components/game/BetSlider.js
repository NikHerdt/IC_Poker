import React from 'react';
import { BetSliderInput } from './BetSliderInput';
import { BetSliderWrapper } from './BetSliderWrapper';

export const BetSlider = ({ currentTable, seatId, bet, setBet }) => {
  if (!currentTable || !currentTable.seats || !currentTable.seats[seatId]) {
    return null;
  }

  const seat = currentTable.seats[seatId];
  const minBet = currentTable.minBet || 0;
  const callAmount = currentTable.callAmount || 0;
  const min = Math.max(minBet, callAmount);
  const max = Math.min(seat.stack || 0, currentTable.limit || seat.stack || 0);
  // Step should be based on minBet (e.g., 0.10 for quick game, 1 for regular)
  const step = minBet >= 1 ? 1 : minBet || 0.01;

  return (
  <BetSliderWrapper>
    <BetSliderInput
      type="range"
      style={{ width: '100%' }}
        step={step}
        min={min}
        max={max}
      value={bet}
      onChange={(e) => setBet(+e.target.value)}
    />
  </BetSliderWrapper>
);
};
