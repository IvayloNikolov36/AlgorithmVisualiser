import { useEffect, useRef, useState } from 'react';
import { cloneDeep } from 'lodash';
import { setTimeOutAfter } from '../../helpers/thread-sleep';
import { Card } from '../../models/card';
import { WaitInSeconds } from "../../constants/sorting-algorithms-constants";
import { createEmptyCards, } from '../../functions/sorting-algorithms-functions';
import { CardsContainer } from './CardsContainer';
import { AuxCardsContainer } from './AuxCardsContainer';

export function MergeSort({ elements, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
    const [cardsField, setCardsField] = useState([]);
    const nullCard = useRef(new Card(null, null));
    const aux = useRef([]);
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
        isSorting.current = true;

        await slice(cardElements, 0, cardElements.length - 1);

        setCardElements(cloneDeep(cardElements));

        isSorting.current = false;
        endSorting(cardElements);
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
        setCardsField(createEmptyCards());
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

    return (
        <>
            <CardsContainer cardElements={cardElements} />
            <AuxCardsContainer cardElements={cardsField} />
        </>
    )
} 