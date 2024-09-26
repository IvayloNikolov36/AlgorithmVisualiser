import { useEffect, useRef } from "react";
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
const MinLabel = 'Min';
const InitialMinLabel = 'Initial Min';
const EmptyLabel = '';
const CardAttributelabel = 'label';
const CardAttributeSelected = 'selected';
const CardAttributeSorted = 'grayOut';

export function SortingAlgorithms() {

    const [cards, setCards] = useState([]);
    const [cardsField, setCardsField] = useState([]);
    const [unsortedCards, setUnsortedCards] = useState([]);
    const [isSorting, setIsSorting] = useState(false);
    const [sortingInfo, setSortingInfo] = useState('');
    const [showCardsField, setShowCardsField] = useState(false);
    const nullCard = useRef(new Card(null, null));
    const aux = useRef([]);

    useEffect(() => {
        const initialCards = createCards();
        setUnsortedCards(cloneDeep(initialCards));
        setCards(initialCards);
        setCardsField(createCardsField());
    }, [])

    const createCardsField = () => {
        const cardsField = [];

        for (let i = 0; i < CardsCount; i++) {
            cardsField.push(nullCard.current);
        }

        return cardsField;
    }

    const startQuickSort = async () => {
        setIsSorting(true);

        let startIndex = 0;
        let endIndex = cards.length - 1;

        await quickSortSortPartition(startIndex, endIndex);

        setAttribute(cards, CardAttributeSorted, false);
        setSortingInfo('');
        setCards(cloneDeep(cards));

        setIsSorting(false);
    }

    const quickSortSortPartition = async (startIndex, endIndex) => {

        if (startIndex > endIndex) {
            return;
        }

        if (startIndex === endIndex) {
            setAttribute([cards[startIndex]], CardAttributeSorted, true);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);
            return;
        }

        const pivotValue = cards[startIndex].value;
        let storeIndex = startIndex + 1;

        setAttribute([cards[startIndex]], CardAttributelabel, 'Pivot');
        setSortingInfo(`Store Index: ${storeIndex}`);
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);

        for (let currentCardIndex = startIndex + 1; currentCardIndex <= endIndex; currentCardIndex++) {
            const currentValue = cards[currentCardIndex].value;

            setAttribute([cards[currentCardIndex]], CardAttributeSelected, true);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);

            if (currentValue <= pivotValue) {
                if (currentCardIndex !== storeIndex) {

                    setAttribute([cards[currentCardIndex]], CardAttributeSelected, false);
                    setAttribute([cards[storeIndex], cards[currentCardIndex]], CardAttributelabel, SwapLabel);
                    setCards(cloneDeep(cards));

                    await swap(cards, storeIndex, currentCardIndex);

                    await setTimeOutAfter(WaitInSeconds);
                }

                storeIndex++;
                setSortingInfo(`Store Index: ${storeIndex}`);
                setAttribute([cards[currentCardIndex]], CardAttributeSelected, false);
                setCards(cloneDeep(cards));
            }

            setAttribute([cards[currentCardIndex]], CardAttributeSelected, false);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);
        }

        const sortedIndex = storeIndex - 1;

        setAttribute([cards[startIndex]], CardAttributelabel, 'Pivot Swap');
        setAttribute([cards[sortedIndex]], CardAttributelabel, 'Store Index - 1 Swap');
        await setTimeOutAfter(WaitInSeconds);

        await swap(cards, startIndex, sortedIndex);

        await setTimeOutAfter(WaitInSeconds);

        setAttribute([cards[sortedIndex]], CardAttributeSorted, true);
        setAttribute([cards[sortedIndex]], CardAttributelabel, EmptyLabel);

        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);

        await quickSortSortPartition(startIndex, sortedIndex - 1);
        await quickSortSortPartition(sortedIndex + 1, endIndex);
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
                    setAttribute(cards, CardAttributeSorted, false);
                    setCards(cloneDeep(cards));
                    await setTimeOutAfter(WaitInSeconds);
                    break;
                }

                setAttribute([cards[lastUnsortedIndex]], CardAttributeSorted, true);
                await setTimeOutAfter(WaitInSeconds);

                firstIndex = 0;
                secondIndex = 1;
                cardsTraverseCount++;
                lastUnsortedIndex--;
                hasSwap = false;
            }

            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            setAttribute([firstCard, secondCard], CardAttributeSelected, true);
            setAttribute([firstCard], CardAttributelabel, 'first');
            setAttribute([secondCard], CardAttributelabel, 'second');
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);

            if (isGreaterThan(firstCard.value, secondCard.value)) {
                setAttribute([firstCard, secondCard], CardAttributelabel, SwapLabel);

                await swap(cards, firstIndex, secondIndex);
                hasSwap = true;

                await setTimeOutAfter(WaitInSeconds);
            }

            if (firstIndex === 0 && secondIndex === lastUnsortedIndex) {
                setAttribute([firstCard, secondCard], CardAttributeSorted, true);
                await clearCardsSelectionsAndLabels([firstCard, secondCard]);
                setAttribute(cards, CardAttributeSorted, false);
                setCards(cloneDeep(cards));
                break;
            }

            firstIndex++;
            secondIndex++;

            await clearCardsSelectionsAndLabels([firstCard, secondCard]);
        }

        setIsSorting(false);
    }

    const startInsertionSort = async () => {
        setIsSorting(true);
        setShowCardsField(true);
        await setTimeOutAfter(WaitInSeconds);

        let index = 1;

        while (index < cards.length) {

            setAttribute([cards[index - 1]], CardAttributeSorted, true);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);

            const currentValue = cards[index].value;
            const previousValue = cards[index - 1].value;

            if (currentValue < previousValue) {

                const extracted = cards[index];
                cards[index] = nullCard.current;
                setCards(cloneDeep(cards));
                await setTimeOutAfter(WaitInSeconds);

                cardsField[index] = extracted;
                setCardsField(cloneDeep(cardsField));
                await setTimeOutAfter(WaitInSeconds);

                await moveForward(cards, index - 1);

                let insertIndex = index - 1;

                while (insertIndex >= 0) {
                    if (insertIndex === 0 || extracted.value >= cards[insertIndex - 1].value) {
                        cards[insertIndex] = extracted;
                        setAttribute([cards[insertIndex]], CardAttributeSorted, true);

                        cardsField[index] = nullCard.current;
                        setCardsField(cloneDeep(cardsField));
                        setCards(cloneDeep(cards));
                        await setTimeOutAfter(WaitInSeconds);
                        break;
                    }
                    await moveForward(cards, insertIndex - 1);
                    insertIndex--;
                }
            }

            index++;
        }

        setAttribute(cards, CardAttributeSorted, false);
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
        setIsSorting(false);
        setShowCardsField(false);
    }

    const startSelectionSort = async () => {
        setIsSorting(true);

        let iteration = 0;

        while (iteration < cards.length - 1) {
            const initialMinValueIndex = iteration;
            let minValueIndex = initialMinValueIndex;
            let minValue = cards[minValueIndex].value;

            setAttribute([cards[minValueIndex]], CardAttributelabel, MinLabel);
            setCards(cloneDeep(cards));
            await setTimeOutAfter(WaitInSeconds);

            for (let index = iteration + 1; index < cards.length; index++) {

                setAttribute([cards[index]], CardAttributeSelected, true);
                setCards(cloneDeep(cards));
                await setTimeOutAfter(WaitInSeconds);

                const currentValue = cards[index].value;
                if (currentValue < minValue) {
                    minValue = currentValue;
                    setAttribute([cards[minValueIndex]], CardAttributelabel, EmptyLabel);
                    setAttribute([cards[iteration]], CardAttributelabel, InitialMinLabel);
                    minValueIndex = index;
                    setAttribute([cards[minValueIndex]], CardAttributelabel, MinLabel);
                }

                setAttribute([cards[index]], CardAttributeSelected, false);
                setCards(cloneDeep(cards));
                await setTimeOutAfter(WaitInSeconds);
            }

            if (initialMinValueIndex !== minValueIndex) {
                setAttribute([cards[minValueIndex]], CardAttributelabel, EmptyLabel);
                setAttribute([cards[initialMinValueIndex], cards[minValueIndex]], CardAttributelabel, SwapLabel);
                await swap(cards, initialMinValueIndex, minValueIndex);
                setAttribute([cards[initialMinValueIndex], cards[minValueIndex]], CardAttributelabel, EmptyLabel);
                await setTimeOutAfter(WaitInSeconds);
            } else {
                setAttribute([cards[initialMinValueIndex]], CardAttributelabel, EmptyLabel);
            }

            await setCardSorted(cards[initialMinValueIndex]);

            iteration++;
        }

        setAttribute(cards, CardAttributelabel, EmptyLabel);
        await setCardSorted(cards[cards.length - 1]);

        setAttribute(cards, CardAttributeSorted, false);
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);

        setIsSorting(false);
    }

    const startMergeSort = async () => {
        setIsSorting(true);
        setShowCardsField(true);

        await slice(cards, 0, cards.length - 1);

        setCards(cloneDeep(cards));
        setIsSorting(false);
        setShowCardsField(false);
    }

    const slice = async (array, start, end) => {
        if (start >= end) {
            return;
        }

        const middle = parseInt(start + (end - start) / 2);

        await slice(array, start, middle);
        await slice(array, middle + 1, end);

        await merge(array, start, middle, end);
    }

    const merge = async (array, start, mid, end) => {
        setCardsField(createCardsField());
        setCardsField(cloneDeep(cardsField));

        if (array[mid].value < array[mid + 1].value) {

            /* UI */
            await setTimeOutAfter(WaitInSeconds);

            for (let index = start; index <= end; index++) {
                cardsField[index] = array[index];
                array[index] = nullCard.current;
            }

            setCardsField(cloneDeep(cardsField));

            for (let index = start; index <= end; index++) {
                array[index] = cardsField[index];
            }

            await setTimeOutAfter(WaitInSeconds);
            /* end UI code */

            return;
        }

        for (let index = start; index <= end; index++) {
            aux.current[index] = array[index];

            cardsField[index] = array[index];
            array[index] = nullCard.current;
        }

        setCardsField(cloneDeep(cardsField));
        await setTimeOutAfter(WaitInSeconds);

        let i = start;
        let j = mid + 1;

        for (let index = start; index <= end; index++) {
            if (i > mid) {
                array[index] = aux.current[j++];
            } else if (j > end) {
                array[index] = aux.current[i++];
            } else if (aux.current[i].value < aux.current[j].value) {
                array[index] = aux.current[i++];
            } else {
                array[index] = aux.current[j++];
            }
        }
    }

    const clearCardsSelectionsAndLabels = async (cardsArr) => {
        setAttribute(cardsArr, CardAttributeSelected, false);
        setAttribute(cardsArr, CardAttributelabel, EmptyLabel);
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const setAttribute = (cards, attribute, value) => {
        cards.forEach(card => card[`${attribute}`] = value);
    }

    const setCardSorted = async (card, cardIndex) => {
        card.grayOut = true;
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const moveForward = async (cards, index) => {
        cards[index].showRightSwapArrow = true;
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);

        const temp = cards[index];
        cards[index] = cards[index + 1];
        cards[index + 1] = temp;

        cards[index + 1].showRightSwapArrow = false;
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const swap = async (cards, fromIndex, toIndex) => {
        await showCardsSwapArrows(cards[fromIndex], cards[toIndex]);

        const temp = cards[fromIndex];
        cards[fromIndex] = cards[toIndex];
        cards[toIndex] = temp;

        cards[fromIndex].showLeftSwapArrow = false;
        cards[toIndex].showRightSwapArrow = false;
        setAttribute([cards[fromIndex], cards[toIndex]], CardAttributelabel, EmptyLabel);

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

    const getCardStructure = (card, index, showArrows = false) => {
        return <div
            className={`card ${card?.grayOut ? 'grayOutCard' : ''} ${card?.selected ? 'selectedCard' : ''} justify-content-between`}
            key={index}
        >
            {getCardDetailsRow(card)}

            {
                showArrows
                && (card.showLeftSwapArrow || card.showRightSwapArrow)
                && getCardArrowsStructure(card.showLeftSwapArrow)
            }

            <div className="verticalFlip">
                {getCardDetailsRow(card)}
            </div>
        </div>
    }

    const getCardArrowsStructure = (showLeftArrow) => {
        return <div className={showLeftArrow ? 'arrow-left' : 'arrow-right'}>
            <span></span>
            <span></span>
            <span></span>
        </div>
    }

    const getCardDetailsRow = (card) => {
        return <div className="d-flex">
            <span className="cardValue" style={{ color: card?.color }}>{card?.value}</span>
            <span className="cardSymbol" style={{ color: card?.color }} dangerouslySetInnerHTML={{ __html: card?.suit }}></span>
        </div>
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-around px-3 py-2">
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
                    <Button
                        onClick={startMergeSort}
                        variant="outline-primary"
                        disabled={isSorting}
                    >
                        Merge Sort
                    </Button>
                </ButtonGroup>
            </div>
            <div className="d-flex justify-content-center mx-5 mt-2 cards-info">
                <span className="text-info fs-4">{sortingInfo}</span>
            </div>
            <div className="d-flex justify-content-around mx-3 my-1 pt-1">
                {
                    cards.map((card, index) => {
                        return <div
                            className="d-flex-col"
                            key={index}
                        >
                            <div className="d-flex align-items-end card-label text-start">
                                <span>{card.label}</span>
                            </div>

                            {getCardStructure(card, index, true)}

                            <div className="d-flex align-items-end text-start mt-3 ms-1">
                                <span className="text-info fs-5">{index}</span>
                            </div>
                        </div>
                    })
                }
            </div>
            {
                showCardsField &&
                <div className="d-flex justify-content-around mx-3 my-1 pt-1">
                    {
                        cardsField.map((card, index) => {
                            return <div className="d-flex-col">
                                {getCardStructure(card, index, false)}
                            </div>
                        })
                    }
                </div>
            }
        </div>
    );
}