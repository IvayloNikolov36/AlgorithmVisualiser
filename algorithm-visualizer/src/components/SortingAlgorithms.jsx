import { useEffect, useRef } from "react";
import { useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";
import { setTimeOutAfter } from "../helpers/thread-sleep";
import { cloneDeep, random } from "lodash";
import { Button, ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';

import { BubbleSort } from "./sorting/BubbleSort";
import { InsertionSort } from "./sorting/InsertionSort";
import { QuickSort } from "./sorting/QuickSort";

import {
    CardsCount,
    CardAttributeSorted,
    CardAttributelabel,
    CardAttributeSelected,
    EmptyLabel,
    InitialMinLabel,
    MinLabel,
    SwapLabel,
    WaitInSeconds
} from "../constants/sorting-algorithms-constants";

export function SortingAlgorithms() {

    const [cards, setCards] = useState([]);
    const [cardsField, setCardsField] = useState([]);
    const [unsortedCards, setUnsortedCards] = useState([]);

    const isSorting = useRef(false);

    const [sortingInfo, setSortingInfo] = useState('');
    
    const [showCardsField, setShowCardsField] = useState(false);
    const nullCard = useRef(new Card(null, null));
    const aux = useRef([]);

    const [isBubbleSort, setIsBubbleSort] = useState(false);
    const [isInsertionSort, setIsInsertionSort] = useState(false);
    const [isQuickSort, setIsQuickSort] = useState(false);

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

    const startSelectionSort = async () => {
        isSorting.current = true;

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

        isSorting.current = false;
    }

    const startMergeSort = async () => {
        isSorting.current = true;
        setShowCardsField(true);

        await slice(cards, 0, cards.length - 1);

        setCards(cloneDeep(cards));
        isSorting.current = false;
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

    function setAttribute(cards, attribute, value) {
        cards.forEach(card => card[`${attribute}`] = value);
    }

    const setCardSorted = async (card, cardIndex) => {
        card.grayOut = true;
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

    const endSorting = () => {
        isSorting.current = false;
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

    const selectedSortingAlgorithm = (name) => {
        isSorting.current = true;
        switch (name) {
            case 'Bubble Sort': setIsBubbleSort(true); break;
            case 'Insertion Sort': setIsInsertionSort(true); break;
            case 'Quick Sort': setIsQuickSort(true); break;
            default: break;
        }
    }

    const getAlogorithmNames = () => {
        return ['Bubble Sort', 'Quick Sort', 'Insertion Sort', 'Selection Sort', 'Merge Sort'];
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-around px-3 py-2">
                <ButtonGroup>
                    <Button
                        onClick={generateNewCards}
                        variant="outline-primary"
                        disabled={isSorting.current}
                    >
                        Generate New Cards
                    </Button>
                    <Button
                        onClick={reset}
                        variant="outline-primary"
                        disabled={isSorting.current}
                    >
                        Reset
                    </Button>
                </ButtonGroup>

                <DropdownButton id="dropdown-sorting-algorithms" title="Select Algorithm" disabled={isSorting.current}>
                    {
                        getAlogorithmNames().map((name) => {
                            return <Dropdown.Item onClick={() => selectedSortingAlgorithm(name)}>{name}</Dropdown.Item>
                        })
                    }
                </DropdownButton>

                <ButtonGroup>
                    <Button
                        onClick={startSelectionSort}
                        variant="outline-primary"
                        disabled={isSorting.current}
                    >
                        Selection Sort
                    </Button>
                    <Button
                        onClick={startMergeSort}
                        variant="outline-primary"
                        disabled={isSorting.current}
                    >
                        Merge Sort
                    </Button>
                </ButtonGroup>
            </div>

            {
                isBubbleSort && <BubbleSort elements={cards} startSorting={isBubbleSort} endSorting={endSorting} />
            }
            {
                isInsertionSort && <InsertionSort elements={cards} startSorting={isInsertionSort} endSorting={endSorting} />
            }
            {
                isQuickSort && <QuickSort elements={cards} startSorting={isInsertionSort} endSorting={endSorting} />
            }

            {
                !isBubbleSort && !isInsertionSort && !isQuickSort &&
                <>
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
                </>
            }



        </div>
    );
}