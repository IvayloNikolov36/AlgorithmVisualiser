import { useEffect } from "react";
import { useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { cloneDeep } from "lodash";

const WaitInSeconds = 1;

export default function BubbleSort() {

    const [cards, setCards] = useState([]);

    useEffect(() => {
        const initialCards = [
            new Card(6, CardSuitEnum.Diamonds),
            new Card(10, CardSuitEnum.Clubs),
            new Card(7, CardSuitEnum.Hearts),
            new Card(5, CardSuitEnum.Clubs),
            new Card(2, CardSuitEnum.Diamonds),
            new Card(4, CardSuitEnum.Clubs),
            new Card(9, CardSuitEnum.Spades),
            new Card(8, CardSuitEnum.Diamonds),
            new Card(3, CardSuitEnum.Hearts)
        ];

        setCards(initialCards);
    }, [])

    const startSorting = async () => {

        let cardsTraverseCount = 0;
        let firstIndex = 0;
        let secondIndex = 1;
        let hasSwap = false;

        while (true) {

            if (secondIndex >= cards.length) {

                if (cardsTraverseCount > 0 && !hasSwap) {
                    cards.forEach(card => card.grayOut = false);
                    setCards(cloneDeep(cards));
                    break;
                }

                cards[cards.length - 1 - cardsTraverseCount].grayOut = true;
                await setTimeOutAfter(WaitInSeconds);
                firstIndex = 0;
                secondIndex = 1;
                cardsTraverseCount++;
                hasSwap = false;
            }

            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (isGreaterThan(firstCard.value, secondCard.value)) {
                await swap(cards, firstIndex, secondIndex);
                hasSwap = true;
            }

            firstIndex++;
            secondIndex++;
        }
    }

    const swap = async (cards, fromIndex, toIndex) => {
        await showCardsSwapArrows(cards[fromIndex], cards[toIndex]);

        const temp = cards[fromIndex];
        cards[fromIndex] = cards[toIndex];
        cards[toIndex] = temp;

        cards[fromIndex].showLeftSwapArrow = false;
        cards[toIndex].showRightSwapArrow = false;

        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const isGreaterThan = (firstCard, secondCard) => {
        return firstCard > secondCard;
    }

    const showCardsSwapArrows = async (firstCard, secondCard) => {
        firstCard.showRightSwapArrow = true;
        secondCard.showLeftSwapArrow = true;
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const getCardDetailsRow = (card) => {
        return <>
            <span className="cardValue" style={{ color: card.color }}>{card.value}</span>
            <span className="cardSymbol" style={{ color: card.color }} dangerouslySetInnerHTML={{ __html: card.suit }}></span>
        </>
    }

    return (
        <div className="container">
            <div className="btnRow">
                <button onClick={startSorting} className='primaryButton'>Sort</button>
            </div>
            <div className="card-container">
                {
                    cards.map((card, index) => {
                        return <div
                            className={`card ${card.grayOut ? 'grayOutCard' : ''}`}
                            key={index}
                        >
                            <div className="row">
                                {getCardDetailsRow(card)}
                            </div>
                            {
                                (card.showLeftSwapArrow || card.showRightSwapArrow) &&
                                <div className={card.showLeftSwapArrow ? 'arrow-left' : 'arrow-right'}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            }
                            <div className="row verticalFlip">
                                {getCardDetailsRow(card)}
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    );
}