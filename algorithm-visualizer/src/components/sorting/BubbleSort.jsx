import { useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { setTimeOutAfter } from "../../helpers/thread-sleep";
import { CardAttributeSorted, CardAttributeSelected, CardAttributelabel, SwapLabel, WaitInSeconds } from "../../constants/sorting-algorithms-constants";
import { getCardStructure, setAttribute } from "../../functions/sorting-algorithms-functions";

export function BubbleSort({ elements, endSorting }) {

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
                    await setTimeOutAfter(WaitInSeconds);
                    break;
                }

                setAttribute([cardElements[lastUnsortedIndex]], CardAttributeSorted, true);
                await setTimeOutAfter(WaitInSeconds);

                firstIndex = 0;
                secondIndex = 1;
                cardsTraverseCount++;
                lastUnsortedIndex--;
                hasSwap = false;
            }

            const firstCard = cardElements[firstIndex];
            const secondCard = cardElements[secondIndex];

            setAttribute([firstCard, secondCard], CardAttributeSelected, true);
            setAttribute([firstCard], CardAttributelabel, 'first');
            setAttribute([secondCard], CardAttributelabel, 'second');
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(WaitInSeconds);

            if (firstCard.value > secondCard.value) {
                setAttribute([firstCard, secondCard], CardAttributelabel, SwapLabel);

                await swap(cardElements, firstIndex, secondIndex);
                hasSwap = true;

                await setTimeOutAfter(WaitInSeconds);
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

        isSorting.current = false;
        endSorting();
    }

    const clearCardsSelectionsAndLabels = async (cardsArr) => {
        setAttribute(cardsArr, CardAttributeSelected, false);
        setAttribute(cardsArr, CardAttributelabel, '');
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(WaitInSeconds);
    }

    const swap = async (cards, fromIndex, toIndex) => {
        await showCardsSwapArrows(cards[fromIndex], cards[toIndex]);

        const temp = cards[fromIndex];
        cards[fromIndex] = cards[toIndex];
        cards[toIndex] = temp;

        cards[fromIndex].showLeftSwapArrow = false;
        cards[toIndex].showRightSwapArrow = false;
        setAttribute([cards[fromIndex], cards[toIndex]], CardAttributelabel, '');

        setCardElements(cloneDeep(cardElements));
    }

    const showCardsSwapArrows = async (firstCard, secondCard) => {
        firstCard.showRightSwapArrow = true;
        secondCard.showLeftSwapArrow = true;
        setCardElements(cloneDeep(cardElements));

        await setTimeOutAfter(WaitInSeconds);
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