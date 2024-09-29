import { useEffect, useRef } from "react";
import { useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";
import { cloneDeep, random } from "lodash";
import { Button, ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import {
    BubbleSort,
    InsertionSort,
    QuickSort,
    MergeSort,
    SelectionSort
} from "./sorting";
import { CardsCount } from "../constants/sorting-algorithms-constants";
import { SortingAlgorithmEnum } from "../enums/sorting-algorithm.enum";


export function SortingAlgorithms() {

    const [cards, setCards] = useState([]);
    const [unsortedCards, setUnsortedCards] = useState([]);
    const isSorting = useRef(false);
    const [selectedSortAlgorithm, setSelectedSortAlgorithm] = useState(null);

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

    const reset = () => {
        setCards(cloneDeep(unsortedCards));
    }

    const endSorting = () => {
        isSorting.current = false;
    }

    const selectedSortingAlgorithm = (name) => {
        isSorting.current = true;

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

    const getAlogorithmNames = () => {
        return [
            SortingAlgorithmEnum.BubbleSort,
            SortingAlgorithmEnum.QuickSort,
            SortingAlgorithmEnum.InsertionSort,
            SortingAlgorithmEnum.SelectionSort,
            SortingAlgorithmEnum.MergeSort
        ];
    }

    const renderSelectedAlgorithm = () => {
        debugger;

        switch (selectedSortAlgorithm) {
            case SortingAlgorithmEnum.BubbleSort:
                return (<BubbleSort elements={cards} endSorting={endSorting} />);
            case SortingAlgorithmEnum.QuickSort:
                return (<QuickSort elements={cards} endSorting={endSorting} />);
            case SortingAlgorithmEnum.SelectionSort:
                return (<SelectionSort elements={cards} endSorting={endSorting} />);
            case SortingAlgorithmEnum.InsertionSort:
                return (<InsertionSort elements={cards} endSorting={endSorting} />);
            case SortingAlgorithmEnum.MergeSort:
                return (<MergeSort elements={cards} endSorting={endSorting} />);
            default: return (<></>);
        }
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-start px-3 py-2 gap-5">
                <DropdownButton
                    id="dropdown-sorting-algorithms"
                    title="Select Algorithm"
                    disabled={isSorting.current}
                >
                    {
                        getAlogorithmNames().map((name) => {
                            return <Dropdown.Item
                                onClick={() => selectedSortingAlgorithm(name)}
                                key={name}
                            >
                                {name}
                            </Dropdown.Item>
                        })
                    }
                </DropdownButton>
                <ButtonGroup>
                    <Button
                        onClick={generateNewCards}
                        variant="outline-primary"
                        disabled={isSorting.current}
                    > Generate New Cards
                    </Button>
                    <Button
                        onClick={reset}
                        variant="outline-primary"
                        disabled={isSorting.current}
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