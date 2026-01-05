import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import cards from './cards';

const StyledPokerCardWrapper = styled.div`
  display: inline-block;
  margin: 1rem 0.5rem;
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
  -webkit-animation: fadeInUp 0.5s forwards;
  animation-delay: ${({ index }) => (index || 0) * 0.1}s;
  -webkit-animation-delay: ${({ index }) => (index || 0) * 0.1}s;
  
  /* Fallback: ensure cards are visible if animation doesn't work */
  @media (prefers-reduced-motion: reduce) {
    opacity: 1 !important;
    animation: none !important;
  }
  
  /* Force visibility after animation should complete */
  ${({ $forceVisible }) => $forceVisible && `
    opacity: 1 !important;
  `}

  @keyframes fadeInUp {
    from {
      -webkit-transform: translate3d(0, 40px, 0);
      transform: translate3d(0, 40px, 0);
    }

    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  @-webkit-keyframes fadeInUp {
    from {
      -webkit-transform: translate3d(0, 40px, 0);
      transform: translate3d(0, 40px, 0);
    }

    to {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }

  img {
    width: ${({ width }) => width || '7vw'};
    max-width: ${({ maxWidth }) => maxWidth || '80px'};
    min-width: ${({ minWidth }) => minWidth || '50px'};
    box-shadow: 10px 10px 30px rgba(0, 0, 0, 0.1);
    display: block;
  }
`;

const PokerCard = ({ card, width, minWidth, maxWidth, index = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fallback: ensure visible after animation should complete (0.5s + delay)
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 600 + (index * 100));
    
    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [index]);

  if (!card || !card.suit || !card.rank) {
    console.warn('PokerCard: Invalid card data', { card });
    return null;
  }

  const { suit, rank } = card;
  
  // Handle hidden cards
  if (suit === 'hidden' && rank === 'hidden') {
    return (
      <StyledPokerCardWrapper
        width={width}
        minWidth={minWidth}
        maxWidth={maxWidth}
      >
      <img src={cards.hiddenhidden} alt="hidden" onError={(e) => {
        console.error('Failed to load hidden card image');
        e.target.style.display = 'none';
      }} onLoad={() => {
        console.log('Hidden card image loaded');
        setIsVisible(true);
      }} />
      </StyledPokerCardWrapper>
    );
  }

  const concat = suit + rank;
  const cardImage = cards[concat];

  if (!cardImage) {
    console.warn('PokerCard: Card image not found for', concat, {
      suit,
      rank,
      concat,
      availableKeys: Object.keys(cards).filter(k => k.startsWith(suit)).slice(0, 5),
      allKeys: Object.keys(cards)
    });
    return null;
  }
  
  console.log('PokerCard: Rendering', concat, 'from', cardImage);

  return (
    <StyledPokerCardWrapper
      width={width}
      minWidth={minWidth}
      maxWidth={maxWidth}
      index={index}
      $forceVisible={isVisible}
    >
      <img src={cardImage} alt={concat} onLoad={() => {
        // Force animation to trigger by ensuring element is in DOM
        console.log('Card image loaded:', concat);
      }} onError={(e) => {
        console.error('Failed to load card image:', concat, cardImage);
        e.target.style.display = 'none';
      }} />
    </StyledPokerCardWrapper>
  );
};

export default PokerCard;
