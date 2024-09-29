import { Card } from "../models/card";

export const setAttribute = (cards, attribute, value) => {
    cards.forEach(card => card[`${attribute}`] = value);
}

export const createEmptyCards = (cardsCount) => {
    const cardsField = [];
    const nullCard = new Card(null, null);

    for (let i = 0; i < cardsCount; i++) {
        cardsField.push(nullCard);
    }

    return cardsField;
}

export const getCardStructure = (card, index, showArrows = false) => {
    return <div
        className={`card ${card?.grayOut ? 'grayOutCard' : ''} ${card?.selected ? 'selectedCard' : ''} justify-content-between`}
        key={index}
    >
        {getCardDetailsRow(card)}
        {
            showArrows
            && (card.showLeftSwapArrow || card.showRightSwapArrow)
            && getCardArrowsStructure(card.showLeftSwapArrow)
        }
        <div className="verticalFlip">
            {getCardDetailsRow(card)}
        </div>
    </div>
}

export const getCardDetailsRow = (card) => {
    return <div className="d-flex">
        <span className="cardValue" style={{ color: card?.color }}>{card?.value}</span>
        <span className="cardSymbol" style={{ color: card?.color }} dangerouslySetInnerHTML={{ __html: card?.suit }}></span>
    </div>
}

export const getCardArrowsStructure = (showLeftArrow) => {
    return <div className={showLeftArrow ? 'arrow-left' : 'arrow-right'}>
        <span></span>
        <span></span>
        <span></span>
    </div>
}