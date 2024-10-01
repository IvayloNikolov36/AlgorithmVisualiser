import { useEffect, useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";
import { cloneDeep, random } from "lodash";
import { Button, ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import {
    BubbleSort,
    InsertionSort,
    QuickSort,
    MergeSort,
    SelectionSort,
    CardsContainer
} from "./sorting";
import { CardAttributelabel, CardsCount, EmptyLabel, WaitInSeconds } from "../constants/sorting-algorithms-constants";
import { SortingAlgorithmEnum } from "../enums/sorting-algorithm.enum";
import { setAttribute } from "../functions/sorting-algorithms-functions";
import { setTimeOutAfter } from "../helpers/thread-sleep";

export function SortingAlgorithms() {

    const [cards, setCards] = useState([]);
    const [unsortedCards, setUnsortedCards] = useState([]);
    const [selectedSortAlgorithm, setSelectedSortAlgorithm] = useState(null);
    const [isSorting, setIsSorting] = useState(false);

    useEffect(() => {
        const initialCards = createCards();
        setUnsortedCards(cloneDeep(initialCards));
        setCards(initialCards);
    }, [])

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

    const swap = async (cards, fromIndex, toIndex) => {
        await showCardsSwapArrows(cards, fromIndex, toIndex);

        const temp = cards[fromIndex];
        cards[fromIndex] = cards[toIndex];
        cards[toIndex] = temp;

        cards[fromIndex].showLeftSwapArrow = false;
        cards[toIndex].showRightSwapArrow = false;
        setAttribute([cards[fromIndex], cards[toIndex]], CardAttributelabel, EmptyLabel);
    }

    const showCardsSwapArrows = async (cards, fromIndex, toIndex) => {
        cards[fromIndex].showRightSwapArrow = true;
        cards[toIndex].showLeftSwapArrow = true;
        setCards(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    const reset = () => {
        setCards(cloneDeep(unsortedCards));
    }

    const endSorting = (cardElements) => {
        setIsSorting(false);
        setCards(cloneDeep(cardElements));
    }

    const startAlgorithm = () => {
        setIsSorting(true);
    }

    const selectedSortingAlgorithm = (name) => {
        switch (name) {
            case SortingAlgorithmEnum.BubbleSort:
                setSelectedSortAlgorithm(SortingAlgorithmEnum.BubbleSort);
                break;
            case 'Insertion Sort':
                setSelectedSortAlgorithm(SortingAlgorithmEnum.InsertionSort);
                break;
            case 'Quick Sort':
                setSelectedSortAlgorithm(SortingAlgorithmEnum.QuickSort);
                break;
            case SortingAlgorithmEnum.SelectionSort:
                setSelectedSortAlgorithm(SortingAlgorithmEnum.SelectionSort);
                break;
            case SortingAlgorithmEnum.MergeSort:
                setSelectedSortAlgorithm(SortingAlgorithmEnum.MergeSort);
                break;
            default: break;
        }
    }

    const getDropdownTitle = () => {
        if (selectedSortAlgorithm === null) {
            return 'Select Algorithm';
        }

        return selectedSortAlgorithm;
    }

    const getAlgorithmNames = () => {
        return [
            SortingAlgorithmEnum.BubbleSort,
            SortingAlgorithmEnum.QuickSort,
            SortingAlgorithmEnum.InsertionSort,
            SortingAlgorithmEnum.SelectionSort,
            SortingAlgorithmEnum.MergeSort
        ];
    }

    const renderSelectedAlgorithm = () => {
        if (!isSorting) {
            return <CardsContainer cardElements={cards} />;
        }

        switch (selectedSortAlgorithm) {
            case SortingAlgorithmEnum.BubbleSort:
                return (<BubbleSort elements={cards} swap={swap} endSorting={endSorting} />);
            case SortingAlgorithmEnum.QuickSort:
                return (<QuickSort elements={cards} swap={swap} endSorting={endSorting} />);
            case SortingAlgorithmEnum.SelectionSort:
                return (<SelectionSort elements={cards} swap={swap} endSorting={endSorting} />);
            case SortingAlgorithmEnum.InsertionSort:
                return (<InsertionSort elements={cards} endSorting={endSorting} />);
            case SortingAlgorithmEnum.MergeSort:
                return (<MergeSort elements={cards} endSorting={endSorting} />);
            default: return;
        }
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-around px-3 py-2">
                <DropdownButton
                    id="dropdown-sorting-algorithms"
                    title={getDropdownTitle()}
                    variant="outline-primary"
                    disabled={isSorting}
                >
                    {
                        getAlgorithmNames().map((name) => {
                            return <Dropdown.Item
                                onClick={() => selectedSortingAlgorithm(name)}
                                key={name}
                            > {name}
                            </Dropdown.Item>
                        })
                    }
                </DropdownButton>
                <Button
                    onClick={startAlgorithm}
                    variant="outline-primary"
                    disabled={isSorting || selectedSortAlgorithm === null}
                > Start Algorithm
                </Button>
                <ButtonGroup>
                    <Button
                        onClick={generateNewCards}
                        variant="outline-primary"
                        disabled={isSorting}
                    > Generate New Cards
                    </Button>
                    <Button
                        onClick={reset}
                        variant="outline-primary"
                        disabled={isSorting}
                    > Reset
                    </Button>
                </ButtonGroup>
            </div>
            {
                renderSelectedAlgorithm()
            }
        </div>
    );
}