import { useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { setTimeOutAfter } from "../../helpers/thread-sleep";
import {
    CardAttributeSorted,
    CardAttributeSelected,
    CardAttributelabel,
    InitialMinLabel,
    MinLabel,
    SwapLabel,
    WaitInSeconds,
    EmptyLabel
} from "../../constants/sorting-algorithms-constants";
import { getCardStructure, setAttribute, setCardSorted } from "../../functions/sorting-algorithms-functions";

export function SelectionSort({ elements, swap, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
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

    const sort = async () => {
        isSorting.current = true;

        let iteration = 0;

        while (iteration < cardElements.length - 1) {
            const initialMinValueIndex = iteration;
            let minValueIndex = initialMinValueIndex;
            let minValue = cardElements[minValueIndex].value;

            setAttribute([cardElements[minValueIndex]], CardAttributelabel, MinLabel);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(WaitInSeconds);

            for (let index = iteration + 1; index < cardElements.length; index++) {

                setAttribute([cardElements[index]], CardAttributeSelected, true);
                setCardElements(cloneDeep(cardElements));
                await setTimeOutAfter(WaitInSeconds);

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
                await setTimeOutAfter(WaitInSeconds);
            }

            if (initialMinValueIndex !== minValueIndex) {
                setAttribute([cardElements[minValueIndex]], CardAttributelabel, EmptyLabel);
                setAttribute([cardElements[initialMinValueIndex], cardElements[minValueIndex]], CardAttributelabel, SwapLabel);
                await swap(cardElements, initialMinValueIndex, minValueIndex);
                setCardElements(cloneDeep(cardElements));
                setAttribute([cardElements[initialMinValueIndex], cardElements[minValueIndex]], CardAttributelabel, EmptyLabel);
                await setTimeOutAfter(WaitInSeconds);
            } else {
                setAttribute([cardElements[initialMinValueIndex]], CardAttributelabel, EmptyLabel);
            }

            setCardSorted(cardElements[initialMinValueIndex]);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(WaitInSeconds);

            iteration++;
        }

        setAttribute(cardElements, CardAttributelabel, EmptyLabel);
        setCardSorted(cardElements[cardElements.length - 1]);
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(WaitInSeconds);

        setAttribute(cardElements, CardAttributeSorted, false);
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(WaitInSeconds);

        isSorting.current = false;
        endSorting();
    }

    return (
        <div className="d-flex justify-content-around mx-3 my-1 pt-1">
            {
                cardElements?.map((card, index) => {
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
    )
} 