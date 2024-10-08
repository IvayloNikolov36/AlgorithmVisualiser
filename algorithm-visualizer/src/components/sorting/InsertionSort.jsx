import { useEffect, useRef, useState } from 'react';
import { setTimeOutAfter } from '../../helpers/thread-sleep';
import { Card } from '../../models/card';
import { CardAttributeSorted, DefaultWaitInSeconds } from "../../constants/sorting-algorithms-constants";
import { createEmptyCards, setAttribute } from '../../functions/sorting-algorithms-functions';
import { CardsContainer } from './CardsContainer';
import { AuxCardsContainer } from './AuxCardsContainer';
import { cloneDeep } from 'lodash';


export function InsertionSort({ elements, waitInSeconds, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
    const [cardsField, setCardsField] = useState([]);
    const nullCard = useRef(new Card(null, null));
    const wait = useRef(DefaultWaitInSeconds);
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

    useEffect(() => {
        wait.current = waitInSeconds;
    }, [waitInSeconds])

    const sort = async () => {
        let index = 1;

        while (index < cardElements.length) {

            setAttribute([cardElements[index - 1]], CardAttributeSorted, true);
            setCardElements(cloneDeep(cardElements));
            await setTimeOutAfter(wait.current);

            const currentValue = cardElements[index].value;
            const previousValue = cardElements[index - 1].value;

            if (currentValue < previousValue) {

                const extracted = cardElements[index];
                cardElements[index] = nullCard.current;
                setCardElements(cloneDeep(cardElements));
                await setTimeOutAfter(wait.current);

                cardsField[index] = extracted;
                setCardsField(cloneDeep(cardsField));
                await setTimeOutAfter(wait.current);

                await moveForward(cardElements, index - 1);

                let insertIndex = index - 1;

                while (insertIndex >= 0) {
                    if (insertIndex === 0 || extracted.value >= cardElements[insertIndex - 1].value) {
                        cardElements[insertIndex] = extracted;
                        setAttribute([cardElements[insertIndex]], CardAttributeSorted, true);

                        cardsField[index] = nullCard.current;
                        setCardsField(cloneDeep(cardsField));
                        setCardElements(cloneDeep(cardElements));
                        await setTimeOutAfter(wait.current);
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
        await setTimeOutAfter(wait.current);

        endSorting(cardElements);
    }

    const moveForward = async (cards, index) => {
        cards[index].showRightSwapArrow = true;
        setCardElements(cloneDeep(cards));
        await setTimeOutAfter(wait.current);

        const temp = cards[index];
        cards[index] = cards[index + 1];
        cards[index + 1] = temp;

        cards[index + 1].showRightSwapArrow = false;
        setCardElements(cloneDeep(cards));
        await setTimeOutAfter(wait.current);
    }

    return (
        <>
            <CardsContainer cardElements={cardElements} />
            <AuxCardsContainer cardElements={cardsField} />
        </>
    )
}