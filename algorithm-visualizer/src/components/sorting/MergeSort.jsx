import { useEffect, useRef, useState } from 'react';
import { setTimeOutAfter } from '../../helpers/thread-sleep';
import { Card } from '../../models/card';
import { CardsCount, DefaultWaitInSeconds } from "../../constants/sorting-algorithms-constants";
import { createEmptyCards, } from '../../functions/sorting-algorithms-functions';
import { CardsContainer } from './CardsContainer';
import { AuxCardsContainer } from './AuxCardsContainer';
import { cloneDeep } from 'lodash';


export function MergeSort({ elements, waitInSeconds, endSorting }) {

    const [cardElements, setCardElements] = useState([]);
    const [cardsField, setCardsField] = useState([]);
    const cardsFieldRef = useRef([]);
    const aux = useRef([]);
    const nullCard = useRef(new Card(null, null));
    const wait = useRef(DefaultWaitInSeconds);
    const isSorting = useRef(false);

    useEffect(() => {
        setCardElements(cloneDeep(elements));
        cardsFieldRef.current = createEmptyCards(CardsCount);
        setCardsField(cardsFieldRef.current);
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

        const emptyCards = createEmptyCards(CardsCount);
        cardsFieldRef.current = emptyCards;
        setCardsField(emptyCards);
        await setTimeOutAfter(wait.current);

        if (array[mid].value < array[mid + 1].value) {

            for (let index = start; index <= end; index++) {
                cardsFieldRef.current[index] = array[index];
                array[index] = nullCard.current;
            }

            setCardsField(cloneDeep(cardsFieldRef.current));
            await setTimeOutAfter(wait.current);

            for (let index = start; index <= end; index++) {
                array[index] = cardsFieldRef.current[index];
                cardsFieldRef.current[index] = nullCard.current;
            }

            setCardsField(cloneDeep(cardsFieldRef.current));
            await setTimeOutAfter(wait.current);

            return;
        }

        for (let index = start; index <= end; index++) {
            aux.current[index] = array[index];

            cardsFieldRef.current[index] = array[index];
            array[index] = nullCard.current;
        }

        setCardsField(cloneDeep(cardsFieldRef.current));
        await setTimeOutAfter(wait.current);

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