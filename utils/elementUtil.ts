import { isElement } from '@/utils/userGuard'

export function convertHTMLCollectionToElements(value: HTMLCollection): Element[] | undefined{
    if (!value) {
        return undefined;
    }
    const arrayCollection = [...value];
    if (arrayCollection && arrayCollection.every((e) => isElement(e))) {
        return [...value];
    } else {
        return undefined;
    }
}