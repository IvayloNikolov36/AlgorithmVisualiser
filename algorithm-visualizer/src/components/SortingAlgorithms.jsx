import { useEffect } from "react";
import { useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { cloneDeep, random } from "lodash";
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

const WaitInSeconds = 0.7;
const CardsCount = 8;
const SwapLabel = 'swap';
const EmptyLabel = '';

export function SortingAlgorithms() {

    const [cards, setCards] = useState([]);
    const [unsortedCards, setUnsortedCards] = useState([]);
    const [isSorting, setIsSorting] = useState(false);
    const [sortingInfo, setSortingInfo] = useState('');

    useEffect(() => {
        const initialCards = createCards();
        setUnsortedCards(cloneDeep(initialCards));
        setCards(initialCards);
    }, [])

    const startQuickSort = async () => {
        setIsSorting(true);

        let startIndex = 0;
        let endIndex = cards.length - 1;

        await quickSortSortPartition(startIndex, endIndex);

        setGrayOutFlag(cards, false);
        setSortingInfo('');
        setCards(cloneDeep(cards));

        setIsSorting(false);
    }

    const quickSortSortPartition = async (startIndex, endIndex) => {

        if (startIndex > endIndex) {
            return;
        }

        if (startIndex === endIndex) {
            setGrayOutFlag([cards[startIndex]], true);
            await updateCards();
            return;
        }

        const pivotValue = cards[startIndex].value;
        let storeIndex = startIndex + 1;

        setLabel([cards[startIndex]], 'Pivot');
        setSortingInfo(`Store Index: ${storeIndex}`);
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);

        for (let currentCardIndex = startIndex + 1; currentCardIndex <= endIndex; currentCardIndex++) {
            const currentValue = cards[currentCardIndex].value;

            setSelected([cards[currentCardIndex]], true);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);

            if (currentValue <= pivotValue) {
                if (currentCardIndex !== storeIndex) {

                    setSelected([cards[currentCardIndex]], false);
                    setLabel([cards[storeIndex], cards[currentCardIndex]], SwapLabel);
                    setCards(cloneDeep(cards));

                    await swap(cards, storeIndex, currentCardIndex);

                    await setTimeOutAfter(WaitInSeconds);
                }

                storeIndex++;
                setSortingInfo(`Store Index: ${storeIndex}`);
                setSelected([cards[currentCardIndex]], false);
                setCards(cloneDeep(cards));
            }

            setSelected([cards[currentCardIndex]], false);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);
        }

        const sortedIndex = storeIndex - 1;

        setLabel([cards[startIndex]], 'Pivot Swap');
        setLabel([cards[sortedIndex]], 'Store Index - 1 Swap');
        await setTimeOutAfter(WaitInSeconds);

        await swap(cards, startIndex, sortedIndex);



        await setTimeOutAfter(WaitInSeconds);

        setGrayOutFlag([cards[sortedIndex]], true);
        setLabel([cards[sortedIndex]], EmptyLabel);

        await updateCards();

        await quickSortSortPartition(startIndex, sortedIndex - 1);
        await quickSortSortPartition(sortedIndex + 1, endIndex);
    }

    const updateCards = async () => {
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const startBubbleSort = async () => {
        setIsSorting(true);

        let cardsTraverseCount = 0;
        let hasSwap = false;

        let firstIndex = 0;
        let secondIndex = 1;
        let lastUnsortedIndex = cards.length - 1;

        while (true) {

            if (secondIndex > lastUnsortedIndex) {

                if (cardsTraverseCount > 0 && !hasSwap) {
                    setGrayOutFlag(cards, false);
                    setCards(cloneDeep(cards));
                    await setTimeOutAfter(WaitInSeconds);
                    break;
                }

                setGrayOutFlag([cards[lastUnsortedIndex]], true);
                await setTimeOutAfter(WaitInSeconds);

                firstIndex = 0;
                secondIndex = 1;
                cardsTraverseCount++;
                lastUnsortedIndex--;
                hasSwap = false;
            }

            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            setSelected([firstCard, secondCard], true);
            setLabel([firstCard], 'first');
            setLabel([secondCard], 'second');
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);

            if (isGreaterThan(firstCard.value, secondCard.value)) {
                setLabel([firstCard, secondCard], SwapLabel);

                await swap(cards, firstIndex, secondIndex);
                hasSwap = true;

                await setTimeOutAfter(WaitInSeconds);
            }

            if (firstIndex === 0 && secondIndex === lastUnsortedIndex) {
                setGrayOutFlag([firstCard, secondCard], true);
                await clearCardsSelectionsAndLabels([firstCard, secondCard]);
                setGrayOutFlag(cards, false);
                setCards(cloneDeep(cards));
                break;
            }

            firstIndex++;
            secondIndex++;

            await clearCardsSelectionsAndLabels([firstCard, secondCard]);
        }

        setIsSorting(false);
    }

    const clearCardsSelectionsAndLabels = async (cardsArr) => {
        setSelected(cardsArr, false);
        setLabel(cardsArr, EmptyLabel);
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const startInsertionSort = async () => {
        setIsSorting(true);

        let index = 1;

        while (index < cards.length) {

            const currentValue = cards[index].value;
            const previousValue = cards[index - 1].value;

            if (currentValue < previousValue) {

                const extracted = cards[index];
                // TODO: create a new div to hold the extracted card
                cards[index] = new Card(null, null);

                await moveForward(cards, index - 1);

                let insertIndex = index - 1;

                while (insertIndex >= 0) {
                    if (insertIndex === 0 || extracted.value >= cards[insertIndex - 1].value) {
                        cards[insertIndex] = extracted;
                        await updateCards();
                        break;
                    }
                    await moveForward(cards, insertIndex - 1);
                    insertIndex--;
                }
            }

            index++;
        }

        await updateCards();
        setIsSorting(false);
    }

    const startSelectionSort = async () => {
        setIsSorting(true);

        let iteration = 0;

        while (iteration < cards.length - 1) {
            const initialMinValueIndex = iteration;
            let minValueIndex = initialMinValueIndex;
            let minValue = cards[minValueIndex].value;

            cards[minValueIndex].label = 'Min';
            await updateCards();

            for (let index = iteration + 1; index < cards.length; index++) {
                await setCardSelected(cards, index);

                const currentValue = cards[index].value;
                if (currentValue < minValue) {
                    minValue = currentValue;
                    cards[minValueIndex].label = '';
                    minValueIndex = index;
                    cards[minValueIndex].label = 'Min';
                }

                await clearCardSelected(cards, index);
            }

            if (initialMinValueIndex !== minValueIndex) {
                cards[minValueIndex].label = '';
                await swap(cards, initialMinValueIndex, minValueIndex);
                await setTimeOutAfter(WaitInSeconds);
            }

            await setCardSorted(cards, initialMinValueIndex);

            iteration++;
        }

        clearCardLabels(cards);
        await setCardSorted(cards, cards.length - 1);
        await clearSortedFlag(cards);

        setIsSorting(false);
    }

    const setLabel = (cards, label) => {
        cards.forEach(card => card.label = label);
    }

    const setGrayOutFlag = (cards, isGrayedOut) => {
        cards.forEach(card => card.grayOut = isGrayedOut);
    }

    const setSelected = (cards, isSelected) => {
        cards.forEach(card => card.selected = isSelected);
    }

    const setCardSelected = async (cards, cardIndex) => {
        cards[cardIndex].selected = true;
        await updateCards();
    }

    const clearCardSelected = async (cards, cardIndex) => {
        cards[cardIndex].selected = false;
        await updateCards();
    }

    const clearCardLabels = async (cards) => {
        cards.forEach(c => c.label = '');
        setCards(cards);
    }

    const setCardSorted = async (cards, cardIndex) => {
        cards[cardIndex].grayOut = true;
        await updateCards();
    }

    const clearSortedFlag = async (cards) => {
        cards.forEach(card => card.grayOut = false);
        await updateCards();
    }

    const moveForward = async (cards, index) => {
        cards[index].showRightSwapArrow = true;
        await updateCards();

        const temp = cards[index];
        cards[index] = cards[index + 1];
        cards[index + 1] = temp;

        cards[index + 1].showRightSwapArrow = false;
        await updateCards();
    }

    const swap = async (cards, fromIndex, toIndex) => {
        await showCardsSwapArrows(cards[fromIndex], cards[toIndex]);

        const temp = cards[fromIndex];
        cards[fromIndex] = cards[toIndex];
        cards[toIndex] = temp;

        cards[fromIndex].showLeftSwapArrow = false;
        cards[toIndex].showRightSwapArrow = false;
        setLabel([cards[fromIndex], cards[toIndex]], EmptyLabel);

        setCards(cloneDeep(cards));
    }

    const isGreaterThan = (firstCard, secondCard) => {
        return firstCard > secondCard;
    }

    const generateNewCards = () => {
        const cards = createCards();
        setUnsortedCards(cloneDeep(cards));
        setCards(cards);
    }

    const createCards = () => {
        const cards = [];

        for (let i = 0; i < CardsCount; i++) {
            const value = random(2, 10);
            const suit = getCardSuit(random(1, 4));
            const card = new Card(value, suit);

            cards.push(card);
        }

        return cards;
    }

    const getCardSuit = (value) => {
        switch (value) {
            case 1: return CardSuitEnum.Clubs;
            case 2: return CardSuitEnum.Diamonds;
            case 3: return CardSuitEnum.Hearts;
            case 4: return CardSuitEnum.Spades;
            default: throw Error('Unhandled card suit.');
        }
    }

    const reset = () => {
        setCards(cloneDeep(unsortedCards));
    }

    const showCardsSwapArrows = async (firstCard, secondCard) => {
        firstCard.showRightSwapArrow = true;
        secondCard.showLeftSwapArrow = true;
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const getCardDetailsRow = (card) => {
        return <div className="d-flex">
            <span className="cardValue" style={{ color: card.color }}>{card.value}</span>
            <span className="cardSymbol" style={{ color: card.color }} dangerouslySetInnerHTML={{ __html: card.suit }}></span>
        </div>
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-center py-2">
                <ButtonGroup>
                    <Button
                        onClick={generateNewCards}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Generate New Cards
                    </Button>
                    <Button
                        onClick={reset}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Reset
                    </Button>
                </ButtonGroup>
            </div>
            <div className="d-flex justify-content-center py-2">
                <ButtonGroup>
                    <Button
                        onClick={startBubbleSort}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Bubble Sort
                    </Button>
                    <Button
                        onClick={startQuickSort}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Quick Sort
                    </Button>
                    <Button
                        onClick={startInsertionSort}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Insertion Sort
                    </Button>
                    <Button
                        onClick={startSelectionSort}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Selection Sort
                    </Button>
                </ButtonGroup>
            </div>
            <div className="d-flex justify-content-center mx-5 mt-2 cards-info">
                <span className="text-info fs-4">{sortingInfo}</span>
            </div>
            <div className="d-flex justify-content-around mx-3 my-1 pt-1">
                {
                    cards.map((card, index) => {
                        return <div className="d-flex-col" key={index}
                        >
                            <div className="d-flex align-items-end card-label text-start">
                                <span>{card.label}</span>
                            </div>

                            <div
                                className={`card ${card.grayOut ? 'grayOutCard' : ''} ${card.selected ? 'selectedCard' : ''} justify-content-between`}
                                key={index}
                            >
                                {getCardDetailsRow(card)}
                                {
                                    (card.showLeftSwapArrow || card.showRightSwapArrow) &&
                                    <div className={card.showLeftSwapArrow ? 'arrow-left' : 'arrow-right'}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                }
                                <div className="verticalFlip">
                                    {getCardDetailsRow(card)}
                                </div>
                            </div>

                            <div className="d-flex align-items-end text-start mt-3 ms-1">
                                <span className="text-info fs-5">{index}</span>
                            </div>
                        </div>
                    })
                }
            </div>

        </div>
    );
}