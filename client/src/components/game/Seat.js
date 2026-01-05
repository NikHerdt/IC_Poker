import React, { useContext, useEffect } from 'react';
import Button from '../buttons/Button';
import modalContext from '../../context/modal/modalContext';
import globalContext from '../../context/global/globalContext';
import { ButtonGroup } from '../forms/ButtonGroup';
import { Form } from '../forms/Form';
import { FormGroup } from '../forms/FormGroup';
import { Input } from '../forms/Input';
import gameContext from '../../context/game/gameContext';
import { PositionedUISlot } from './PositionedUISlot';
import { InfoPill } from './InfoPill';
import PokerCard from './PokerCard';
import ChipsAmountPill from './ChipsAmountPill';
import ColoredText from '../typography/ColoredText';
import PokerChip from '../icons/PokerChip';
import { EmptySeat } from './EmptySeat';
import { OccupiedSeat } from './OccupiedSeat';
import { Hand } from './Hand';
import { NameTag } from './NameTag';
import contentContext from '../../context/content/contentContext';
import Markdown from 'react-remarkable';
import DealerButton from '../icons/DealerButton';
import { StyledSeat } from './StyledSeat';

export const Seat = ({ currentTable, seatNumber, isPlayerSeated, sitDown, isQuickGame = false }) => {
  const { openModal, closeModal } = useContext(modalContext);
  const { standUp, seatId, rebuy } = useContext(gameContext);
  const { getLocalizedString } = useContext(contentContext);

  const seat = currentTable.seats[seatNumber];
  const maxBuyin = currentTable.limit;
  const minBuyIn = currentTable.minBet * 2 * 10;
  
  // Quick game auto buy-in amount ($10)
  const QUICK_GAME_BUYIN = 10;

  useEffect(() => {
    if (
      currentTable &&
      isPlayerSeated &&
      seat &&
      seat.id === seatId &&
      seat.stack === 0 &&
      seat.sittingOut
    ) {
      // Show rebuy modal - user picks amount
      openModal(
        () => (
          <Form
            onSubmit={(e) => {
              e.preventDefault();

              const amount = +document.getElementById('amount').value;

              if (
                amount &&
                amount >= minBuyIn &&
                amount <= maxBuyin
              ) {
                rebuy(currentTable.id, seatNumber, parseInt(amount));
                closeModal();
              }
            }}
          >
            <FormGroup>
              <Input
                id="amount"
                type="number"
                min={minBuyIn}
                max={maxBuyin}
                defaultValue={minBuyIn}
              />
            </FormGroup>
            <ButtonGroup>
              <Button primary type="submit" fullWidth>
                {getLocalizedString('game_rebuy-modal_confirm')}
              </Button>
            </ButtonGroup>
          </Form>
        ),
        getLocalizedString('game_rebuy-modal_header'),
        getLocalizedString('game_rebuy-modal_cancel'),
        () => {
          standUp();
          closeModal();
        },
        () => {
          standUp();
          closeModal();
        },
      );
    }
    // eslint-disable-next-line
  }, [currentTable]);

  return (
    <StyledSeat>
      {!seat ? (
        <>
          {!isPlayerSeated ? (
            <Button
              small
              onClick={() => {
                if (isQuickGame) {
                  // Quick game: auto buy-in with 10
                  sitDown(
                    currentTable.id,
                    seatNumber,
                    QUICK_GAME_BUYIN,
                  );
                } else {
                  // Regular table: show buy-in modal
                  openModal(
                    () => (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();

                          const amount = +document.getElementById('amount').value;

                          if (
                            amount &&
                            amount >= minBuyIn &&
                            amount <= maxBuyin
                          ) {
                            sitDown(
                              currentTable.id,
                              seatNumber,
                              parseInt(amount),
                            );
                            closeModal();
                          }
                        }}
                      >
                        <FormGroup>
                          <Input
                            id="amount"
                            type="number"
                            min={minBuyIn}
                            max={maxBuyin}
                            defaultValue={minBuyIn}
                          />
                        </FormGroup>
                        <ButtonGroup>
                          <Button primary type="submit" fullWidth>
                            {getLocalizedString('game_buyin-modal_confirm')}
                          </Button>
                        </ButtonGroup>
                      </Form>
                    ),
                    getLocalizedString('game_buyin-modal_header'),
                    getLocalizedString('game_buyin-modal_cancel'),
                  );
                }
              }}
            >
              {getLocalizedString('game_sitdown-btn')}
            </Button>
          ) : (
            <EmptySeat>
              <Markdown>{getLocalizedString('game_table_empty-seat')}</Markdown>
            </EmptySeat>
          )}
        </>
      ) : (
        <PositionedUISlot
          style={{
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PositionedUISlot top="-6.25rem" left="-75px" origin="top center">
            <NameTag>
              <ColoredText primary textAlign="center">
                {seat.player.name}
                <br />
                {seat.stack && (
                  <ColoredText secondary>
                    <PokerChip width="15" height="15" />{' '}
                    ${new Intl.NumberFormat(
                      document.documentElement.lang,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    ).format(seat.stack)}
                  </ColoredText>
                )}
              </ColoredText>
            </NameTag>
          </PositionedUISlot>
          <PositionedUISlot>
            <OccupiedSeat seatNumber={seatNumber} hasTurn={seat.turn} />
          </PositionedUISlot>
          <PositionedUISlot
            left="4vh"
            style={{
              display: 'flex',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            origin="center right"
          >
            <Hand>
              {seat.hand && seat.hand.length > 0 ? (
                seat.hand.map((card, index) => (
                  <PokerCard
                    key={`${seat.id}-${index}-${card.suit}-${card.rank}`}
                    card={card}
                    width="5vw"
                    maxWidth="60px"
                    minWidth="30px"
                    index={index}
                  />
                ))
              ) : null}
            </Hand>
          </PositionedUISlot>

          {currentTable.button === seatNumber && (
            <PositionedUISlot
              right="35px"
              origin="center left"
              style={{ zIndex: '55' }}
            >
              <DealerButton />
            </PositionedUISlot>
          )}

          <PositionedUISlot
            top="6vh"
            style={{ minWidth: '150px', zIndex: '55' }}
            origin="bottom center"
          >
            <ChipsAmountPill chipsAmount={seat.bet} />
            {!currentTable.handOver && seat.lastAction && (
              <InfoPill>{seat.lastAction}</InfoPill>
            )}
          </PositionedUISlot>
        </PositionedUISlot>
      )}
    </StyledSeat>
  );
};
