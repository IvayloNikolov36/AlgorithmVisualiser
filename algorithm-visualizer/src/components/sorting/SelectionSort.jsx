import { useEffect, useRef, useState } from "react";
import { setTimeOutAfter } from "../../helpers/thread-sleep";
import {
    CardAttributeSorted,
    CardAttributeSelected,
    CardAttributelabel,
    InitialMinLabel,
    MinLabel,
    SwapLabel,
    DefaultWaitInSeconds,
    EmptyLabel
} from "../../constants/sorting-algorithms-constants";
import { setAttribute, setCardSorted } from "../../functions/sorting-algorithms-functions";
import { CardsContainer } from "./CardsContainer";
import { cloneDeep } from "lodash";

export function SelectionSort({ elements, swap, waitInSeconds, endSorting }) {

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
        isSorting.current = true;

        let iteration = 0;

        while (iteration < cardElements.length - 1) {
            const initialMinValueIndex = iteration;
            let minValueIndex = initialMinValueIndex;
            let minValue = cardElements[minValueIndex].value;

            setAttribute([cardElements[minValueIndex]], CardAttributelabel, MinLabel);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);

            for (let index = iteration + 1; index < cardElements.length; index++) {

                setAttribute([cardElements[index]], CardAttributeSelected, true);
                setCardElements(cloneDeep(cardElements));
                await setTimeOutAfter(wait.current);

                const currentValue = cardElements[index].value;
                if (currentValue < minValue) {
                    minValue = currentValue;
                    setAttribute([cardElements[minValueIndex]], CardAttributelabel, EmptyLabel);
                    setAttribute([cardElements[iteration]], CardAttributelabel, InitialMinLabel);
                    minValueIndex = index;
                    setAttribute([cardElements[minValueIndex]], CardAttributelabel, MinLabel);
                }

                setAttribute([cardElements[index]], CardAttributeSelected, false);
                setCardElements(cloneDeep(cardElements));
                await setTimeOutAfter(wait.current);
            }

            if (initialMinValueIndex !== minValueIndex) {
                setAttribute([cardElements[minValueIndex]], CardAttributelabel, EmptyLabel);
                setAttribute([cardElements[initialMinValueIndex], cardElements[minValueIndex]], CardAttributelabel, SwapLabel);
                await swap(cardElements, initialMinValueIndex, minValueIndex);
                setCardElements(cloneDeep(cardElements));
                setAttribute([cardElements[initialMinValueIndex], cardElements[minValueIndex]], CardAttributelabel, EmptyLabel);
                await setTimeOutAfter(wait.current);
            } else {
                setAttribute([cardElements[initialMinValueIndex]], CardAttributelabel, EmptyLabel);
            }

            setCardSorted(cardElements[initialMinValueIndex]);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);

            iteration++;
        }

        setAttribute(cardElements, CardAttributelabel, EmptyLabel);
        setCardSorted(cardElements[cardElements.length - 1]);
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(wait.current);

        setAttribute(cardElements, CardAttributeSorted, false);
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(wait.current);

        isSorting.current = false;
        endSorting(cardElements);
    }

    return (
        <CardsContainer cardElements={cardElements} />
    )
} 