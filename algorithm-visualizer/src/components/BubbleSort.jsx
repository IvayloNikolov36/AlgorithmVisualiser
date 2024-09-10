import { useEffect } from "react";
import { useState } from "react";
import { Card } from "../models/card";
import { CardSuitEnum } from "../enums/card-suit.enum";

export default function BubbleSort() {

    const [cards, setCards] = useState([]);

    useEffect(() => {
        const initialCards = [
            new Card(9, CardSuitEnum.Diamonds),
            new Card(5, CardSuitEnum.Clubs),
            new Card(7, CardSuitEnum.Hearts),
            new Card(3, CardSuitEnum.Clubs),
            new Card(5, CardSuitEnum.Diamonds),
            new Card(4, CardSuitEnum.Clubs),
            new Card(2, CardSuitEnum.Spades),
            new Card(9, CardSuitEnum.Diamonds),
            new Card(8, CardSuitEnum.Hearts)
        ];

        setCards(initialCards);
    }, [])

    const startSorting = () => {

    }

    const getCardDetailsRow = (card) => {
        return <>
            <span className="cardValue" style={{color: card.color}}>{card.value}</span>
            <span className="cardSymbol" style={{color: card.color}} dangerouslySetInnerHTML={{ __html: card.suit }}></span>
        </>
    }

    return (
        <div className="container">
            <div className="btnRow">
                <button onClick={startSorting} className='primaryButton'>Sort</button>
            </div>
            <div className="card-container">
                {
                    cards.map((card) => {
                        return <div className="card">
                            <div className="row">
                               {getCardDetailsRow(card)}
                            </div>
                            <div className="row verticalFlip">
                                {getCardDetailsRow(card)}
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    );
}