import { useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { setTimeOutAfter } from "../../helpers/thread-sleep";
import {
    CardAttributeSorted,
    CardAttributeSelected,
    CardAttributelabel,
    FirstLabel,
    SecondLabel,
    SwapLabel,
    EmptyLabel,
    DefaultWaitInSeconds
} from "../../constants/sorting-algorithms-constants";
import { setAttribute } from "../../functions/sorting-algorithms-functions";
import { CardsContainer } from "./CardsContainer";

export function BubbleSort({ elements, swap, waitInSeconds, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
    const wait = useRef(DefaultWaitInSeconds);
    const isSorting = useRef(false);

    useEffect(() => {
        const clonedElements = cloneDeep(elements);
        setCardElements(clonedElements);
    }, [elements])

    useEffect(() => {
        if (cardElements.length > 0 && !isSorting.current) {
            isSorting.current = true;
            sort();
        }
    }, [cardElements])

    useEffect(() => {
        wait.current = waitInSeconds;
    }, [waitInSeconds])

    const sort = async () => {

        let cardsTraverseCount = 0;
        let hasSwap = false;

        let firstIndex = 0;
        let secondIndex = 1;
        let lastUnsortedIndex = cardElements.length - 1;

        while (true) {

            if (secondIndex > lastUnsortedIndex) {

                if (cardsTraverseCount > 0 && !hasSwap) {
                    setAttribute(cardElements, CardAttributeSorted, false);
                    setCardElements(cloneDeep(cardElements));
                    await setTimeOutAfter(wait.current);
                    break;
                }

                setAttribute([cardElements[lastUnsortedIndex]], CardAttributeSorted, true);
                await setTimeOutAfter(wait.current);

                firstIndex = 0;
                secondIndex = 1;
                cardsTraverseCount++;
                lastUnsortedIndex--;
                hasSwap = false;
            }

            const firstCard = cardElements[firstIndex];
            const secondCard = cardElements[secondIndex];

            setAttribute([firstCard, secondCard], CardAttributeSelected, true);
            setAttribute([firstCard], CardAttributelabel, FirstLabel);
            setAttribute([secondCard], CardAttributelabel, SecondLabel);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);

            if (firstCard.value > secondCard.value) {
                setAttribute([firstCard, secondCard], CardAttributelabel, SwapLabel);

                await swap(cardElements, firstIndex, secondIndex);
                hasSwap = true;

                await setTimeOutAfter(wait.current);
            }

            if (firstIndex === 0 && secondIndex === lastUnsortedIndex) {
                setAttribute([firstCard, secondCard], CardAttributeSorted, true);
                await clearCardsSelectionsAndLabels([firstCard, secondCard]);
                setAttribute(cardElements, CardAttributeSorted, false);
                setCardElements(cloneDeep(cardElements));
                break;
            }

            firstIndex++;
            secondIndex++;

            await clearCardsSelectionsAndLabels([firstCard, secondCard]);
        }

        endSorting(cardElements);
    }

    const clearCardsSelectionsAndLabels = async (cardsArr) => {
        setAttribute(cardsArr, CardAttributeSelected, false);
        setAttribute(cardsArr, CardAttributelabel, EmptyLabel);
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(wait.current);
    }

    return (
        <CardsContainer cardElements={cardElements} />
    )
}