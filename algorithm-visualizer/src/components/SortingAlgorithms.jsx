import { useEffect } from "react";
import { useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { cloneDeep } from "lodash";

const WaitInSeconds = 0.4;

export default function SortingAlgorithms() {

    const [cards, setCards] = useState([]);

    useEffect(() => {
        const initialCards = [
            new Card(10, CardSuitEnum.Diamonds),
            new Card(9, CardSuitEnum.Clubs),
            new Card(4, CardSuitEnum.Hearts),
            new Card(7, CardSuitEnum.Clubs),
            new Card(8, CardSuitEnum.Diamonds),
            new Card(10, CardSuitEnum.Hearts),
            new Card(8, CardSuitEnum.Clubs),
            new Card(7, CardSuitEnum.Diamonds)
        ];

        setCards(initialCards);
    }, [])

    const startQuickSort = async () => {
        let startIndex = 0;
        let endIndex = cards.length - 1;

        await quickSortSortPartition(startIndex, endIndex);
        
        cards.forEach(card => card.grayOut = false);
        setCards(cloneDeep(cards));
    }

    const quickSortSortPartition = async (startIndex, endIndex) => {
        if (startIndex > endIndex) {
            return;
        }

        if (startIndex === endIndex) {
            cards[startIndex].grayOut = true;
            await updateCards();
            return;
        }

        const pivotValue = cards[startIndex].value;
        let storeIndex = startIndex + 1;

        for (let i = startIndex + 1; i <= endIndex; i++) {
            const currentValue = cards[i].value;

            if (currentValue <= pivotValue) {
                if (i !== storeIndex) {
                    await swap(cards, storeIndex, i);
                    setCards(cloneDeep(cards));
                    await setTimeOutAfter(WaitInSeconds);
                }
                storeIndex++;
            }
        }

        const sortedIndex = storeIndex - 1;
        await swap(cards, startIndex, sortedIndex);
        cards[sortedIndex].grayOut = true;

        await updateCards();

        await quickSortSortPartition(startIndex, sortedIndex - 1);
        await quickSortSortPartition(sortedIndex + 1, endIndex);
    }

    const updateCards = async () => {
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const startBubbleSort = async () => {

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
                <button onClick={startBubbleSort} className='primaryButton'>Bubble Sort</button>
                <button onClick={startQuickSort} className='primaryButton'>Quick Sort</button>
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