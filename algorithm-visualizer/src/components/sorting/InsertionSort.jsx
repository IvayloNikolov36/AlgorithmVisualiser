import { useEffect, useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import { setTimeOutAfter } from '../../helpers/thread-sleep';
import { Card } from '../../models/card';
import { CardAttributeSorted, WaitInSeconds } from "../../constants/sorting-algorithms-constants";
import { createEmptyCards, getCardStructure, setAttribute } from '../../functions/sorting-algorithms-functions';

export function InsertionSort({ elements, startSorting, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
    const [cardsField, setCardsField] = useState([]);
    const nullCard = useRef(new Card(null, null));
    const isSorting = useRef(false);

    useEffect(() => {
        const clonedElements = cloneDeep(elements);
        setCardElements(clonedElements);
        setCardsField(createEmptyCards(clonedElements.length));
    }, [elements])

    useEffect(() => {
        if (cardElements.length > 0 && !isSorting.current) {
            isSorting.current = true;
            sort();
        }
    }, [cardElements])

    const sort = async () => {
        let index = 1;

        while (index < cardElements.length) {

            setAttribute([cardElements[index - 1]], CardAttributeSorted, true);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(WaitInSeconds);

            const currentValue = cardElements[index].value;
            const previousValue = cardElements[index - 1].value;

            if (currentValue < previousValue) {

                const extracted = cardElements[index];
                cardElements[index] = nullCard.current;
                setCardElements(cloneDeep(cardElements));
                await setTimeOutAfter(WaitInSeconds);

                cardsField[index] = extracted;
                setCardsField(cloneDeep(cardsField));
                await setTimeOutAfter(WaitInSeconds);

                await moveForward(cardElements, index - 1);

                let insertIndex = index - 1;

                while (insertIndex >= 0) {
                    if (insertIndex === 0 || extracted.value >= cardElements[insertIndex - 1].value) {
                        cardElements[insertIndex] = extracted;
                        setAttribute([cardElements[insertIndex]], CardAttributeSorted, true);

                        cardsField[index] = nullCard.current;
                        setCardsField(cloneDeep(cardsField));
                        setCardElements(cloneDeep(cardElements));
                        await setTimeOutAfter(WaitInSeconds);
                        break;
                    }
                    await moveForward(cardElements, insertIndex - 1);
                    insertIndex--;
                }
            }

            index++;
        }

        setAttribute(cardElements, CardAttributeSorted, false);
        setCardElements(cloneDeep(cardElements));
        await setTimeOutAfter(WaitInSeconds);

        endSorting();
    }

    const moveForward = async (cards, index) => {
        cards[index].showRightSwapArrow = true;
        setCardElements(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);

        const temp = cards[index];
        cards[index] = cards[index + 1];
        cards[index + 1] = temp;

        cards[index + 1].showRightSwapArrow = false;
        setCardElements(cloneDeep(cards));
        await setTimeOutAfter(WaitInSeconds);
    }

    return (
        <>
            <div className="d-flex justify-content-center mx-5 mt-2 cards-info">
            </div>
            <div className="d-flex justify-content-around mx-3 my-1 pt-1">
                {
                    cardElements.map((card, index) => {
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
            <div className="d-flex justify-content-around mx-3 my-1 pt-1">
                {
                    cardsField.map((card, index) => {
                        return <div className="d-flex-col">
                            {getCardStructure(card, index, false)}
                        </div>
                    })
                }
            </div>
        </>
    )
}