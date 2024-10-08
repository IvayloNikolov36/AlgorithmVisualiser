import { useEffect, useRef, useState } from "react";
import { setTimeOutAfter } from "../../helpers/thread-sleep";
import {
    CardAttributeSorted,
    CardAttributeSelected,
    CardAttributelabel,
    EmptyLabel,
    PivotLabel,
    StoreIndexLabel,
    SwapLabel,
    DefaultWaitInSeconds
} from "../../constants/sorting-algorithms-constants";
import { setAttribute } from "../../functions/sorting-algorithms-functions";
import { CardsContainer } from "./CardsContainer";
import { cloneDeep } from "lodash";

export function QuickSort({ elements, swap, waitInSeconds, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
    const [sortingInfo, setSortingInfo] = useState('');
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

        let startIndex = 0;
        let endIndex = cardElements.length - 1;

        await sortPartition(startIndex, endIndex);

        setAttribute(cardElements, CardAttributeSorted, false);
        setSortingInfo(EmptyLabel);
        setCardElements(cloneDeep(cardElements));

        isSorting.current = false;
        endSorting(cardElements);
    }

    const sortPartition = async (startIndex, endIndex) => {

        if (startIndex > endIndex) {
            return;
        }

        if (startIndex === endIndex) {
            setAttribute([cardElements[startIndex]], CardAttributeSorted, true);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);
            return;
        }

        const pivotValue = cardElements[startIndex].value;
        let storeIndex = startIndex + 1;

        setAttribute([cardElements[startIndex]], CardAttributelabel, PivotLabel);
        setSortingInfo(getStoreIndexLabel(storeIndex));
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(wait.current);

        for (let currentCardIndex = startIndex + 1; currentCardIndex <= endIndex; currentCardIndex++) {
            const currentValue = cardElements[currentCardIndex].value;

            setAttribute([cardElements[currentCardIndex]], CardAttributeSelected, true);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);

            if (currentValue <= pivotValue) {
                if (currentCardIndex !== storeIndex) {

                    setAttribute([cardElements[currentCardIndex]], CardAttributeSelected, false);
                    setAttribute([cardElements[storeIndex], cardElements[currentCardIndex]], CardAttributelabel, SwapLabel);
                    setCardElements(cloneDeep(cardElements));

                    await swap(cardElements, storeIndex, currentCardIndex);

                    await setTimeOutAfter(wait.current);
                }

                storeIndex++;
                setSortingInfo(getStoreIndexLabel(storeIndex));
                setAttribute([cardElements[currentCardIndex]], CardAttributeSelected, false);
                setCardElements(cloneDeep(cardElements));
            }

            setAttribute([cardElements[currentCardIndex]], CardAttributeSelected, false);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);
        }

        const sortedIndex = storeIndex - 1;

        setAttribute([cardElements[startIndex]], CardAttributelabel, `${PivotLabel} ${SwapLabel}`);
        setAttribute([cardElements[sortedIndex]], CardAttributelabel, `${StoreIndexLabel} - 1 ${SwapLabel}`);
        await setTimeOutAfter(wait.current);

        await swap(cardElements, startIndex, sortedIndex);

        await setTimeOutAfter(wait.current);

        setAttribute([cardElements[sortedIndex]], CardAttributeSorted, true);
        setAttribute([cardElements[sortedIndex]], CardAttributelabel, EmptyLabel);

        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(wait.current);

        await sortPartition(startIndex, sortedIndex - 1);
        await sortPartition(sortedIndex + 1, endIndex);
    }

    const getStoreIndexLabel = (index) => {
        return `${StoreIndexLabel}: ${index}`;
    }

    return (
        <>
            <div className="d-flex justify-content-center mx-5 mt-2 cards-info">
                <span className="text-info fs-4">{sortingInfo}</span>
            </div>
            <CardsContainer cardElements={cardElements} />
        </>
    )
}