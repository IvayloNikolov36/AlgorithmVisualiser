import { CardSuitEnum } from "../enums/card-suit.enum";

export class Card {
    constructor (value, suit) {
        this.value = value;
        this.suit = suit;
        this.color = (suit === CardSuitEnum.Diamonds || suit === CardSuitEnum.Hearts)
            ? 'red'
            : 'black';
        this.grayOut = false;
        this.showLeftSwapArrow = false;
        this.showRightSwapArrow = false;
    }    
}